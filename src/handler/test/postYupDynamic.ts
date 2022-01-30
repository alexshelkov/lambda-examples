import { GetHandler, ok } from 'lambda-mdl';

import { jsonRes as res } from '../../service';
import { LogTypes, YupSchema } from '../../text';
import { yupDynamicValidator } from '../../yupDynamic';

const resValid = res
  .opt({
    yup: {
      text: YupSchema,
    },
  })
  .srv(yupDynamicValidator);

const handler: GetHandler<typeof resValid, { message: string; type: LogTypes }, never> = async ({
  service: { logger, fields: { text } },
}) => {
  const { message, type } = text;

  logger.log(message);

  return ok({ message, type });
};

export const handle = resValid.ok(handler).req();
