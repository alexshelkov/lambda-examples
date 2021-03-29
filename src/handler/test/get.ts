import { ok } from '@alexshelkov/result';
import { creator, Handler, GetService, loggerService, transportService } from '@alexshelkov/lambda';

const res = creator(transportService).srv(loggerService);

type Service = GetService<typeof res>;

const handler: Handler<Service, string, never> = async ({ service: { logger } }) => {
  logger.log('say hello');

  return ok(`hello: ${new Date().toISOString().split('T')[1].slice(0, 8)}`);
};

export const handle = res.ok(handler).req();
