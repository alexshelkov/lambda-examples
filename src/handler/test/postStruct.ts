import { ok } from 'lambda-res';
import { GetHandler } from 'lambda-mdl';

import { jsonRes as res } from '../../service';
import { LogTypes, structService } from '../../text';

const resValid = res.srv(structService);

const handler: GetHandler<typeof resValid, { message: string; type: LogTypes }, never> = async ({
  service: { logger, text },
}) => {
  const { message, type } = text;

  logger.log(message);

  return ok({ message, type });
};

export const handle = resValid.ok(handler).req();
