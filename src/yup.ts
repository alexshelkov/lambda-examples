import {
  MiddlewareCreator,
  JsonBodyService,
  EventGatewayService,
  ServiceOptions,
  addService,
} from '@alexshelkov/lambda';

import { ObjectSchema, Asserts } from 'yup';
import { ObjectShape } from 'yup/lib/object';

type Helper<Shape extends ObjectShape> = { [k: string]: ObjectSchema<Shape> };
type Service<Shape extends ObjectShape, Schema extends Helper<Shape>> = {
  [k in keyof Schema]: Asserts<Schema[k]>;
};
type YupDeps = JsonBodyService | EventGatewayService | (JsonBodyService & EventGatewayService);

export const yupValidator = <Shape extends ObjectShape, Schemas extends Helper<Shape>>(
  schemas: Schemas
): MiddlewareCreator<ServiceOptions, Service<Shape, Schemas>, never, YupDeps> => {
  return () => {
    return async (request) => {
      let body: unknown;

      if ('jsonBody' in request.service && 'eventGateway' in request.service) {
        body = request.service.jsonBody;
      } else if ('jsonBody' in request.service) {
        body = request.service.jsonBody;
      } else {
        body = request.service.eventGateway.queryStringParameters || {};
      }

      const service = {} as Service<Shape, Schemas>;

      await Promise.all(
        Object.entries(schemas).map(async ([name, schema]) => {
          service[name as keyof Schemas] = await schema.validate(body);

          return undefined;
        })
      );

      return addService(request, service);
    };
  };
};
