import { Middleware } from 'lambda-mdl';

import { ObjectShape, Helper, Service, YupErrors, YupDeps, yupMiddleware } from './yup';

export const yupDynamicValidator = <Shape extends ObjectShape, Schemas extends Helper<Shape>>(
  options: Partial<{ yup: Schemas }>
): Middleware<Service<Shape, Schemas>, YupErrors, YupDeps> => {
  return yupMiddleware(options.yup);
};
