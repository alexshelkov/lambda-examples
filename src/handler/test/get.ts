import { ok } from '@alexshelkov/result';
import { Handler } from '@alexshelkov/lambda';

import { Service, res } from '../../service';

const handler: Handler<Service, {message: string}, never> = async ({ context, service: { logger, eventGateway } }) => {
  const message = eventGateway.queryStringParameters?.message || 'hello';

  logger.log(message);

  return ok({message});
};

export const handle = res.ok(handler).req();
