import {
  MiddlewareCreator,
  JsonBodyService,
  EventGatewayService,
  ServiceOptions,
  Err,
  Middleware,
  ServiceContainer,
  Request,
  AwsEvent,
  addService,
  fail,
} from '@alexshelkov/lambda';

import { ObjectSchema, Asserts, ValidationError } from 'yup';
import { ObjectShape } from 'yup/lib/object';

export { ObjectShape };
export type Helper<Shape extends ObjectShape> = { [k: string]: ObjectSchema<Shape> };
export type Service<Shape extends ObjectShape, Schema extends Helper<Shape>> = {
  [k in keyof Schema]: Asserts<Schema[k]>;
};

export type YupDeps =
  | JsonBodyService
  | EventGatewayService
  | (JsonBodyService & EventGatewayService);

export type YupUnknownErr = Err<'YupUnknownErr'>;
export type YupValidationErr = Err<'YupValidationErr'>;
export type YupErrors = YupUnknownErr | YupValidationErr;

export const yupMiddleware = <Shape extends ObjectShape, Schemas extends Helper<Shape>>(
  schemas: Schemas | undefined
): Middleware<Service<Shape, Schemas>, YupErrors, YupDeps> => {
  return async <Service1 extends ServiceContainer>(
    request: Request<AwsEvent, Service1 & YupDeps>
  ) => {
    let body: unknown;

    const service = {} as Service<Shape, Schemas>;

    if (!schemas) {
      return addService(request, service);
    }

    if ('jsonBody' in request.service && 'eventGateway' in request.service) {
      body = request.service.jsonBody;
    } else if ('jsonBody' in request.service) {
      body = request.service.jsonBody;
    } else {
      body = request.service.eventGateway.queryStringParameters || {};
    }

    // eslint-disable-next-line no-restricted-syntax
    for (const [name, schema] of Object.entries(schemas)) {
      try {
        // eslint-disable-next-line no-await-in-loop
        service[name as keyof Schemas] = await schema.validate(body);
      } catch (err) {
        if (err instanceof ValidationError) {
          return fail('YupValidationErr', { message: err.message });
        }

        return fail('YupUnknownErr');
      }
    }

    return addService(request, service);
  };
};

export const yupValidator = <Shape extends ObjectShape, Schemas extends Helper<Shape>>(
  schemas: Schemas
): MiddlewareCreator<ServiceOptions, Service<Shape, Schemas>, YupErrors, YupDeps> => {
  return () => {
    return yupMiddleware(schemas);
  };
};
