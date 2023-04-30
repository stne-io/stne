import { MetaKeys } from '../../constants.ts';
import { HttpMethod } from '../../defs.ts';
import { Reflect } from '../../deps.ts';
import { ControllerMetadata, defaultMetadata } from './controller.ts';

export function ApiEndpoint(path = '/', requestMethod: HttpMethod) {
  return defineRouteDecorator(path, requestMethod);
}

const defineRouteDecorator = (path = '/', requestMethod: HttpMethod): MethodDecorator =>
// deno-lint-ignore ban-types
(target: Object, propertyKey: string | symbol): void => {
  const meta: ControllerMetadata =
    Reflect.getOwnMetadata(MetaKeys.CONTROLLER, target.constructor) ?? defaultMetadata();

  meta.routes.set(propertyKey, {
    requestMethod,
    path,
    methodName: propertyKey,
  });

  Reflect.defineMetadata(MetaKeys.CONTROLLER, meta, target.constructor);
};
