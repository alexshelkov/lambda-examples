import { GetHandler, ok } from 'lambda-mdl';

import { jsonRes as res } from '../../service';
import { LogTypes, yupService } from '../../text';

const resValid = res.srv(yupService);

const handler: GetHandler<
  typeof resValid,
  { message: string; test?: number; type: LogTypes },
  never
> = async ({
  service: {
    logger,
    fields: { text },
  },
}) => {
  const { message, type, test } = text;

  logger.log(message);

  return ok({ message, type, test });
};

export const handle = resValid.ok(handler).req();
