// deno-lint-ignore-file ban-types
import { CONTROLLER_META_PROPKEY } from '../../constants.ts';
import { ConstructableFunc, RouteDefinition } from '../../defs.ts';
import { Reflect } from '../../deps.ts';

export enum RouteParamType {
  BODY = 'body',
  PARAM = 'param',
  QUERY = 'query',
  HEADER = 'header',
}

export interface RouteArgumentMeta {
  type: RouteParamType;
  key?: string;
  index: number;
  argValue: string | symbol;
}

export interface ControllerMetadata {
  prefix: string;
  routes: Map<string | symbol, RouteDefinition>;
  isSingleton: boolean;
  routeArgsMap: Map<string | symbol, Array<RouteArgumentMeta>>;
}

export function defaultMetadata(): ControllerMetadata {
  return {
    prefix: '/',
    routes: new Map<string, RouteDefinition>(),
    isSingleton: true,
    routeArgsMap: new Map<string | symbol, Array<RouteArgumentMeta>>(),
  };
}

export function Controller<T>(prefix = '/') {
  return (target: ConstructableFunc<T>): void => {
    const meta: ControllerMetadata = Reflect.getMetadata(CONTROLLER_META_PROPKEY, target) ??
      defaultMetadata();
    meta.prefix = prefix;
    Reflect.defineMetadata(CONTROLLER_META_PROPKEY, meta, target);
  };
}

export function setControllerMetaData(target: Object, value: ControllerMetadata): void {
  Reflect.defineMetadata(CONTROLLER_META_PROPKEY, value, target.constructor);
}

export function getControllerMeta(target: Object): ControllerMetadata | undefined {
  return Reflect.getMetadata(CONTROLLER_META_PROPKEY, target.constructor);
}
