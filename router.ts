import { ControllerMetadata } from './common/decorators/controller.ts';
import { RouteDefinition } from './defs.ts';
import { Middleware, Router as OakRouter, RouterContext } from './deps.ts';
import { ControllerContainer } from './injector/defs.ts';

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
        // deno-lint-ignore no-explicit-any
        const result = await (controller.instance() as any)[route.methodName](); //.apply();
        context.response.body = result;
        context.response.status = 200; // TODO result가 status 까지 줘야함
      });
    });
    this.#appendToBootstrapMsg('');
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
