import { Err } from 'lambda-res';
import { addService, MiddlewareCreator, Transport } from 'lambda-mdl';

import createSlackApi from './lib';

// eslint-disable-next-line @typescript-eslint/ban-types
export type SlackTransportOptions = {};
export type SlackTransportService = { transport: Transport };
export type SlackTransportNoWebhookUrl = { type: 'SlackTransportNoWebhookUrl' } & Err;
export type SlackTransportNotDeliverableError = { type: 'SlackTransportNotDeliverableError' } & Err;
export type SlackTransportErrors = SlackTransportNoWebhookUrl | SlackTransportNotDeliverableError;
export type SlackTransportDeps = { transport: Transport };

export const slackTransport: MiddlewareCreator<
  SlackTransportOptions,
  SlackTransportService,
  SlackTransportErrors,
  SlackTransportDeps
> = (_o, { throws }) => {
  if (!process.env.WEBHOOK_URL) {
    throw throws<SlackTransportNoWebhookUrl>('SlackTransportNoWebhookUrl');
  }

  const api = createSlackApi(process.env.WEBHOOK_URL);

  return async (request, { destroy }) => {
    const sending: Promise<unknown>[] = [];

    destroy(async () => {
      try {
        await Promise.all(sending);
      } catch (err: unknown) {
        throws<SlackTransportNotDeliverableError>('SlackTransportNotDeliverableError', {
          message: err instanceof Error ? err.message : 'Unknown',
        });
      }
    });

    const { send } = api;

    return addService(request, {
      transport: {
        send(type: string, data: unknown[], meta: Record<string, unknown>) {
          request.service.transport.send(type, data, meta);
          sending.push(send(JSON.stringify(data)));
        },
      },
    });
  };
};
