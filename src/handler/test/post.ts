import { Request, route, AwsEvent, ServiceOptions, ok } from 'lambda-mdl';

import { jsonRes as res } from '../../service';
import { joinedValidator, JoinedService } from '../../joinedValidator';
import { StructService, YupService } from '../../text';

const yupRoute = (
  request: Request<AwsEvent, ServiceOptions, JoinedService>
): Request<AwsEvent, ServiceOptions, YupService> | false => {
  return request.service.validator === 'yup'
    ? (request as Request<AwsEvent, ServiceOptions, YupService>)
    : false;
};

const structRoute = (
  request: Request<AwsEvent, ServiceOptions, JoinedService>
): Request<AwsEvent, ServiceOptions, StructService> | false => {
  return request.service.validator === 'struct'
    ? (request as Request<AwsEvent, ServiceOptions, StructService>)
    : false;
};

const yupHandle = route(yupRoute)(
  async ({
    service: {
      fields: { text },
    },
  }) => {
    const { type, message } = text;

    return ok({
      validator: 'yup',
      yup: {
        type,
        message,
      },
    });
  }
);

const structHandle = route(structRoute)(
  async ({
    service: {
      fields: { text },
    },
  }) => {
    const { type, message } = text;

    return ok({
      validator: 'struct',
      struct: {
        type,
        message,
      },
    });
  }
);

export const handle = res.srv(joinedValidator).ok(yupHandle).ok(structHandle).req();
