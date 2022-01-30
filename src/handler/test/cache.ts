import { GetHandler, ok } from 'lambda-mdl';

import { res } from '../../service';
import { pack } from '../../cache';

const res2 = res.pack(pack);

const handler: GetHandler<
  typeof res2,
  { name: string; message: string; cache: false },
  never
> = async ({ service: { eventGateway, cache } }) => {
  const name = eventGateway.queryStringParameters?.name || 'alex';
  const message = eventGateway.queryStringParameters?.message || 'hello';

  cache.store(name, message);

  return ok({ name, message, cache: false });
};

export const handle = res2.ok(handler).req();
