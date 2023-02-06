export interface RouteDefinition {
  path: string;
  requestMethod: HttpMethod;
  methodName: string | symbol;
}

export enum HttpMethod {
  GET = 'get',
  POST = 'post',
  PUT = 'put',
  PATCH = 'patch',
  DELETE = 'delete',
}

// deno-lint-ignore no-explicit-any
export type ConstructableFunc<T = unknown> = new (...args: any[]) => T;

// deno-lint-ignore no-explicit-any
export interface Type<T = any> extends Function {
  // deno-lint-ignore no-explicit-any
  new (...args: any[]): T;
}
