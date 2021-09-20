import {
  Request,
  route,
  AwsEvent,
  MiddlewareCreator,
  addService,
  JsonBodyService,
  EventGatewayService,
  ServiceOptions,
  ok,
  fail,
} from 'lambda-mdl';
import { APIGatewayProxyEvent } from 'aws-lambda';

import { jsonRes as res } from '../../service';
import {
  StructService,
  YupService,
  StructErrors,
  YupErrors,
  structService,
  yupService,
} from '../../text';

type JoinedService = (StructService | YupService) & { validator: 'yup' | 'struct' };
type JoinedErrors = StructErrors | YupErrors;
type JoinedDeps = JsonBodyService | EventGatewayService | (JsonBodyService & EventGatewayService);

const yupRoute = (
  request: Request<AwsEvent, JoinedService>
): Request<AwsEvent, YupService> | false => {
  return request.service.validator === 'yup' ? (request as Request<AwsEvent, YupService>) : false;
};

const structRoute = (
  request: Request<AwsEvent, JoinedService>
): Request<AwsEvent, StructService> | false => {
  return request.service.validator === 'struct'
    ? (request as Request<AwsEvent, StructService>)
    : false;
};

const joinedValidator: MiddlewareCreator<
  ServiceOptions,
  JoinedService,
  JoinedErrors,
  JoinedDeps,
  { event: APIGatewayProxyEvent; context: unknown }
> = (options, creator) => {
  return async (request, lifecycle) => {
    let validator: 'yup' | 'struct';
    let middleware;

    if (request.event.queryStringParameters?.validator === 'yup') {
      validator = 'yup';
      middleware = yupService(options, creator);
    } else {
      validator = 'struct';
      middleware = structService(options, creator);
    }

    const service = await middleware(request, lifecycle);

    if (service.isOk()) {
      return addService(request, {
        ...service.ok().service,
        validator,
      });
    }

    return fail<JoinedErrors>(service.err().type, service.err());
  };
};

const h1 = route(yupRoute)(({ service: { text } }) => {
  const { type, message } = text;

  return Promise.resolve(
    ok({
      yup: {
        type,
        message,
      },
    })
  );
});

const h2 = route(structRoute)(({ service: { text } }) => {
  const { type, message } = text;

  return Promise.resolve(
    ok({
      struct: {
        type,
        message,
      },
    })
  );
});

export const handle = res.srv(joinedValidator).ok(h1).ok(h2).req();
