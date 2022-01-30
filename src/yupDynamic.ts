import { Middleware, ServiceOptions } from 'lambda-mdl';

import { ObjectShape, Helper, Fields, YupErrors, YupDeps, yupMiddleware } from './yup';

export const yupDynamicValidator = <Shape extends ObjectShape, Schemas extends Helper<Shape>>(
  options: Partial<{ yup: Schemas }>
): Middleware<ServiceOptions, { fields: Fields<Shape, Schemas> }, YupErrors, YupDeps> => {
  return yupMiddleware(options.yup);
};
