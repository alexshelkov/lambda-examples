import {
  ServiceOptions,
  EventGatewayService,
  Package,
  Err,
  ok,
  fail,
  addService,
} from 'lambda-mdl';

export type CacheService = {
  cache: {
    store: (name: string, message: string) => void;
    get: (name: string) => string | undefined;
  };
};
export type CacheFoundError = Err<'CacheFoundError', { data: { name: string; message: string } }>;
export type CacheErrors = CacheFoundError;

export const pack: Package<
  ServiceOptions,
  CacheService,
  CacheErrors,
  never,
  never,
  { name: string; message: string; cache: boolean },
  never,
  CacheFoundError,
  EventGatewayService
> = {
  srv: () => {
    const storage: Record<string, string> = {};

    return async (request) => {
      const { eventGateway } = request.service;

      const name = eventGateway.queryStringParameters?.name || 'alex';

      if (storage[name]) {
        return fail('CacheFoundError', { data: { name, message: storage[name] } });
      }

      return addService(request, {
        cache: {
          get(n: string) {
            return storage[n];
          },
          store(n: string, m: string) {
            storage[n] = m;
          },
        },
      });
    };
  },

  fail: async ({ error }, { returns }) => {
    returns(true);

    const {
      data: { name, message },
    } = error;

    return ok({
      name,
      message,
      cache: true,
    });
  },
};
