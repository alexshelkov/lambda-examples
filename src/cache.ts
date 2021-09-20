import {
  Err,
  MiddlewareCreator,
  HandlerError,
  ServiceOptions,
  RequestError,
  AwsEvent,
  EventGatewayService,
  ok,
  fail,
  routeError,
  addService,
} from 'lambda-mdl';

export type CacheService = { store: (name: string, message: string) => void };
export type CacheFoundError = { type: 'CacheFoundError'; data: { name: string; message: string } };
export type CacheErrors = CacheFoundError;

export const cacheService: MiddlewareCreator<
  ServiceOptions,
  CacheService,
  CacheErrors,
  EventGatewayService
> = () => {
  const storage: Record<string, string> = {};

  return async (request) => {
    const { eventGateway } = request.service;

    const name = eventGateway.queryStringParameters?.name || 'alex';

    if (storage[name]) {
      return fail('CacheFoundError', { data: { name, message: storage[name] } });
    }

    return addService(request, {
      store(n: string, m: string) {
        storage[n] = m;
      },
    });
  };
};

const isCacheErr = (
  req: RequestError<AwsEvent, Err>
): RequestError<AwsEvent, CacheErrors> | false => {
  return req.error.type === 'CacheFoundError'
    ? (req as RequestError<AwsEvent, CacheErrors>)
    : false;
};

const cacheFound: HandlerError<
  CacheErrors,
  { name: string; message: string; cache: true },
  Err,
  CacheErrors
> = async (req, _o, { returns }) => {
  returns(() => {
    return true;
  });

  const {
    data: { name, message },
  } = req.error;

  return ok({
    name,
    message,
    cache: true,
  });
};

export const cacheCheck = routeError(isCacheErr)(cacheFound);
