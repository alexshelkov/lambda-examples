import { GetHandler, ok } from 'lambda-mdl';

import { res } from '../../service';

const handler: GetHandler<typeof res, { message: string }, never> = async ({
  service: { logger, eventGateway },
}) => {
  const message = eventGateway.queryStringParameters?.message || 'hello';

  logger.log(message);

  return ok({ message });
};

export const handle = res.ok(handler).req();
