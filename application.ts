import { Application as OakApplication, Context, Response } from './deps.ts';
import { Router } from './router.ts';
import { StneContainer } from './injector/containers.ts';
import { ConstructableFunc } from './defs.ts';
import { ModuleMetadata } from './common/decorators/index.ts';

export interface ApplicationConfig {
  modules: Array<ConstructableFunc<ModuleMetadata>>;
}

export class Application {
  private app: OakApplication;
  private router: Router;
  #container: StneContainer;

  constructor(appConfig: ApplicationConfig) {
    this.router = new Router();
    this.app = new OakApplication();

    // Resolve dependencies and create containers
    this.#container = new StneContainer(appConfig.modules);

    // register routing with the controllers
    const controllers = this.#container.getControllers();
    controllers.forEach((ctrl) => {
      this.router.register(ctrl);
    });
  }

  /**
   * 404 middleware, enabled by default and not disableable
   */
  private handleNotFound(context: Context): void {
    const response: Response = context.response;

    response.status = 404;
    response.body = {
      error: 'Not Found',
      status: 404,
    };
  }

  public async run(port: number): Promise<void> {
    const bootstrapMsg: string = this.router.getBootstrapMsg();
    console.log(bootstrapMsg);
    this.app.use(this.router.middleware());
    this.app.use(this.handleNotFound);
    console.info(`Running on http://localhost:${port}/`);
    await this.app.listen({ port });
  }
}
