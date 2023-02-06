import { CONTROLLER_META_PROPKEY, MetaKeys } from '../../constants.ts';
import { ConstructableFunc, RouteDefinition } from '../../defs.ts';
import { Reflect } from '../../deps.ts';

export interface ControllerMetadata {
  prefix: string;
  routes: Map<string | symbol, RouteDefinition>;
  isSingleton: boolean;
}

export function defaultMetadata(): ControllerMetadata {
  return {
    prefix: '/',
    routes: new Map<string, RouteDefinition>(),
    isSingleton: true,
  };
}

export function Controller<T>(prefix = '/') {
  return (target: ConstructableFunc<T>): void => {
    const meta: ControllerMetadata = Reflect.getMetadata(CONTROLLER_META_PROPKEY, target) ?? defaultMetadata();
    meta.prefix = prefix;
    Reflect.defineMetadata(CONTROLLER_META_PROPKEY, meta, target);
  };
}
