import { APIGatewayProxyEvent } from 'aws-lambda';
import {
  addService,
  EventGatewayService,
  fail,
  JsonBodyService,
  MiddlewareCreator,
  ServiceOptions,
} from 'lambda-mdl';

import {
  StructErrors,
  structService,
  StructService,
  YupErrors,
  yupService,
  YupService,
} from './text';

export type JoinedService = (StructService | YupService) & { validator: 'yup' | 'struct' };
type JoinedErrors = StructErrors | YupErrors;
type JoinedDeps = JsonBodyService | EventGatewayService | (JsonBodyService & EventGatewayService);

export const joinedValidator: MiddlewareCreator<
  ServiceOptions,
  JoinedService,
  JoinedErrors,
  JoinedDeps,
  { event: APIGatewayProxyEvent; context: unknown }
> = (options, creatorLc) => {
  return async (request, middlewareLc) => {
    let validator: 'yup' | 'struct';
    let middleware;

    if (request.event.queryStringParameters?.validator === 'yup') {
      validator = 'yup';
      middleware = yupService(options, creatorLc);
    } else {
      validator = 'struct';
      middleware = structService(options, creatorLc);
    }

    const service = await middleware(request, middlewareLc);

    if (service.isOk()) {
      return addService(request, {
        validator,
        fields: service.ok().fields,
      });
    }

    return fail<JoinedErrors>(service.err().type, service.err());
  };
};
