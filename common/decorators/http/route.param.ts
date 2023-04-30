import {
  ControllerMetadata,
  defaultMetadata,
  getControllerMeta,
  RouteArgumentMeta,
  RouteParamType,
  setControllerMetaData,
} from '../controller.ts';

/**
 * A parameter decorator maps `context.request.body()`
 *
 * ```ts
 * public controllerAction(@Body('name') name: string): any { }
 * ```
 *
 * @param key The key of the value to be retrieved
 * @returns if `key` is specified, return the value of the key from the payload.
 *          otherwise, returns whole `request.body`
 */
export function Body(key?: string): ParameterDecorator {
  return defineRouteParamDecorator(RouteParamType.BODY, key);
}

export function Param(key?: string): ParameterDecorator {
  return defineRouteParamDecorator(RouteParamType.PARAM, key);
}

export function Query(key?: string): ParameterDecorator {
  return defineRouteParamDecorator(RouteParamType.QUERY, key);
}

export function Header(key?: string): ParameterDecorator {
  return defineRouteParamDecorator(RouteParamType.HEADER, key);
}

export const defineRouteParamDecorator =
  (argType: RouteParamType, paramKey?: string): ParameterDecorator =>
  // deno-lint-ignore no-explicit-any
  (target: any, key: string | symbol, index: number): void => {
    const meta: ControllerMetadata = getControllerMeta(target) ?? defaultMetadata();

    const argMeta: RouteArgumentMeta = {
      type: argType,
      key: paramKey,
      index,
      argValue: key,
    };

    if (meta.routeArgsMap.has(key)) {
      const mapValue = meta.routeArgsMap.get(key);
      mapValue!.push(argMeta);
    } else {
      meta.routeArgsMap.set(key, [argMeta]);
    }
    setControllerMetaData(target, meta);
  };
