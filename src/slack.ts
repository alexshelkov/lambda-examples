import { fail, Err } from '@alexshelkov/result';
import { addService, MiddlewareCreator, Transport } from '@alexshelkov/lambda';

import createSlackApi from './lib';

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
> = () => {
  if (!process.env.WEBHOOK_URL) {
    throw fail<SlackTransportNoWebhookUrl>('SlackTransportNoWebhookUrl');
  }

  const api = createSlackApi(process.env.WEBHOOK_URL);

  return async (request, { destroy }) => {
    const sending: Promise<unknown>[] = [];

    destroy(async () => {
      try {
        await Promise.all(sending);
      } catch (err: unknown) {
        throw fail<SlackTransportNotDeliverableError>('SlackTransportNotDeliverableError', {
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
