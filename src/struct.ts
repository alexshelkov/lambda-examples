import {
  Err,
  MiddlewareCreator,
  JsonBodyService,
  EventGatewayService,
  ServiceOptions,
  addService,
  fail,
} from 'lambda-mdl';

import { StructError, Describe, create } from 'superstruct';

type Helper<Schemas> = {
  [k in keyof Schemas]: Schemas[k] extends Describe<infer Schema> ? Describe<Schema> : never;
};
type Services<Schemas> = {
  [k in keyof Schemas]: Schemas[k] extends Describe<infer Schema> ? Schema : never;
};
type Service<Schema> = Schema extends Describe<infer T> ? T : never;
type StructDeps = JsonBodyService | EventGatewayService | (JsonBodyService & EventGatewayService);

export type StructValidationError = {
  type: 'StructValidationError';
  validation: StructError;
} & Err;
export type StructErrors = StructValidationError;

export const structValidator = <Schemas extends Helper<Schemas>>(
  schemas: Schemas
): MiddlewareCreator<ServiceOptions, Services<Schemas>, StructErrors, StructDeps> => {
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

      const services = {} as Services<Schemas>;

      // eslint-disable-next-line no-restricted-syntax
      for (const name in schemas) {
        if (Object.hasOwnProperty.call(schemas, name)) {
          const schema = schemas[name];

          try {
            const service = create(body, schema);

            services[name] = service as Service<Schemas[typeof name]>;
          } catch (err) {
            if (err instanceof StructError) {
              return fail('StructValidationError', { validation: err });
            }
            throw err;
          }
        }
      }

      return addService(request, services);
    };
  };
};
