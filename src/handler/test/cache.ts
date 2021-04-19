import { ok } from 'lambda-res';
import { GetHandler } from 'lambda-mdl';

import { res } from '../../service';
import { cacheService, cacheCheck } from '../../cache';

const res2 = res.srv(cacheService).fail(cacheCheck);

const handler: GetHandler<
  typeof res2,
  { name: string; message: string; cache: false },
  never
> = async ({ service: { eventGateway, store } }) => {
  const name = eventGateway.queryStringParameters?.name || 'alex';
  const message = eventGateway.queryStringParameters?.message || 'hello';

  store(name, message);

  return ok({ name, message, cache: false });
};

export const handle = res2.ok(handler).req();
