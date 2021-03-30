import {fail, Err} from '@alexshelkov/result';
import {addService, MiddlewareCreator, Transport} from '@alexshelkov/lambda';

import createSlackApi from './lib';

export type SlackTransportOptions = {};
export type SlackTransportService = { transport: Transport };
export type SlackTransportErrors = { type: 'NoWebhookUrl' } & Err;
export type SlackTransportDeps = { transport: Transport };

export const slackTransport: MiddlewareCreator<
  SlackTransportOptions,
  SlackTransportService,
  SlackTransportErrors,
  SlackTransportDeps
> = () => {
  const api = createSlackApi(process.env.WEBHOOK_URL || '');

  return async (request, { destroy }) => {
    const sending: Promise<unknown>[] = [];

    destroy(async () => {
      await Promise.all(sending);
    });

    if (!api) {
      return fail('NoWebhookUrl');
    }

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
