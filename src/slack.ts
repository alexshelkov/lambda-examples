import { Err, MiddlewareCreator, Transport, addService } from 'lambda-mdl';
import { IncomingWebhook } from '@slack/webhook';

export type SlackTransportOptions = {};
export type SlackTransportService = { transport: Transport };
export type SlackTransportNoWebhookUrl = { type: 'SlackTransportNoWebhookUrl' } & Err;
export type SlackTransportNotDeliverableError = { type: 'SlackTransportNotDeliverableError' } & Err;
export type SlackTransportErrors = SlackTransportNoWebhookUrl | SlackTransportNotDeliverableError;
export type SlackTransportDeps = { transport: Transport };

const createSlackApi = (url: string): { send: (text: string) => Promise<unknown> } => {
  const webhook = new IncomingWebhook(url);

  return {
    send(text: string): Promise<unknown> {
      return webhook.send({
        text,
      });
    },
  };
};

export const slackTransport: MiddlewareCreator<
  SlackTransportOptions,
  SlackTransportService,
  SlackTransportErrors,
  SlackTransportDeps
> = (_o, { throws }) => {
  if (!process.env.WEBHOOK_URL) {
    return throws<SlackTransportNoWebhookUrl>('SlackTransportNoWebhookUrl');
  }

  const slackApi = createSlackApi(process.env.WEBHOOK_URL);

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

    return addService(request, {
      transport: {
        send(type: string, data: unknown[], meta: Record<string, unknown>) {
          request.service.transport.send(type, data, meta);
          sending.push(slackApi.send(JSON.stringify(data)));
        },
      },
    });
  };
};
