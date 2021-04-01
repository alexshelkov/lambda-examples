import { ok } from '@alexshelkov/result';
import { GetHandler } from '@alexshelkov/lambda';

import * as yup from 'yup';

import { jsonRes as res } from '../../service';
import { yupValidator } from '../../yup';

enum LogTypes {
  error = 'error',
  info = 'info',
  log = 'log',
}

export const textSchema = yup.object({
  message: yup.string().defined(),
  type: yup.mixed<LogTypes>().oneOf(Object.values(LogTypes)).defined(),
});

const resValid = res.srv(yupValidator({ text: textSchema }));

const handler: GetHandler<typeof resValid, { message: string; type: LogTypes }, never> = async ({
  service: { logger, text },
}) => {
  const { message, type } = text;

  logger.log(message);

  return ok({ message, type });
};

export const handle = resValid.ok(handler).req();
