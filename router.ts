import { ControllerMetadata, RouteArgumentMeta, RouteParamType } from './common/decorators/controller.ts';
import { RouteDefinition } from './defs.ts';
import { Middleware, Router as OakRouter, RouterContext } from './deps.ts';
import { ControllerContainer } from './injector/defs.ts';

// deno-lint-ignore no-explicit-any
type OakContext = RouterContext<any>;

export class Router extends OakRouter {
  #bootstrapMsg = 'STNE Framework\n';

  constructor() {
    super();
  }

  getBootstrapMsg(): string {
    return this.#bootstrapMsg;
  }

  register(controller: ControllerContainer): void {
    const { prefix, routes }: ControllerMetadata = controller.meta;

    routes.forEach((route: RouteDefinition): void => {
      const { requestMethod, path } = route;
      const normalizedPath = this.#normalizePath(String(prefix), path);
      this.#appendToBootstrapMsg(` [${requestMethod.toUpperCase()}] ${normalizedPath}\n`);

      // deno-lint-ignore ban-types no-explicit-any
      (<Function>this[route.requestMethod])(normalizedPath, async (context: RouterContext<any>): Promise<void> => {
        const metaArgs = controller.meta.routeArgsMap.get(route.methodName) || [];
        const args = await this.#transformArguments(metaArgs, context);

        // FIXME If 'Content-Type: application/json' header is not specified, the body will return URLSearchParam.

        // deno-lint-ignore no-explicit-any
        const result = await (controller.instance() as any)[route.methodName](...args);
        context.response.body = result;

        // default HTTP response
        context.response.status = 200; // TODO `result` should return result and status
      });
    });
    this.#appendToBootstrapMsg('');
  }

  /**
   * Transform route meta data to it's value
   *
   * @param routeArgs The Arguments of route methods' meta data
   * @param context Context of Oak
   * @returns the value of the arguments to bind
   */
  async #transformArguments(routeArgs: RouteArgumentMeta[], context: OakContext): Promise<any[]> {
    const { params, queries, body, headers } = await this.#getRequestProperties(context);

    // The ordering of incomming arguments are weird, not matched to order of the arguments on the source code.
    // So, sorting must be.
    routeArgs.sort((a, b) => a.index - b.index);
    return routeArgs.map((v) => {
      switch (v.type) {
        case RouteParamType.BODY:
          return body;
        case RouteParamType.HEADER:
          return v.key ? headers[v.key] : headers;
        case RouteParamType.PARAM:
          return v.key ? params[v.key] : params;
        case RouteParamType.QUERY:
          return v.key ? queries[v.key] : queries;
      }
    });
  }

  /**
   * Get params, headers, queries, body from the given context
   *
   * @param context Oak context
   */
  async #getRequestProperties(context: OakContext): Promise<ResultGetRequestProperties> {
    // context 에서 param, header, query, body 를 가져온다.
    const { headers, url } = context.request;

    const headersCopy: Record<string, string> = {};
    for (const [k, v] of headers.entries()) {
      headersCopy[k] = v;
    }

    const queries: Record<string, string> = {};
    for (const [k, v] of url.searchParams.entries()) {
      queries[k] = v;
    }

    const params: Record<string, string> = {};
    for (const [k, v] of Object.entries(context.params)) {
      params[k] = v;
    }

    return {
      params: params,
      headers: headersCopy,
      queries,
      body: context.request.hasBody ? await context.request.body().value : undefined,
    };
  }

  #normalizePath(prefix: string, path: string): string {
    let normalizedPath: string = prefix + path;
    if (normalizedPath.slice(-1) === '/') {
      normalizedPath = normalizedPath.slice(0, -1);
    }
    return normalizedPath;
  }

  #appendToBootstrapMsg(msg: string): string {
    this.#bootstrapMsg += msg;
    return this.#bootstrapMsg;
  }

  middleware(): Middleware {
    return this.routes();
  }
}

interface ResultGetRequestProperties {
  params: Record<string, string>;
  headers: Record<string, string>;
  body: any;
  queries: Record<string, string>;
}
