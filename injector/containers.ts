import { ModuleMetadata } from '../common/decorators/index.ts';
import { ConstructableFunc } from '../defs.ts';
import { ControllerContainer } from './defs.ts';
import { Injector } from './injector.ts';

export class StneContainer {
  #controllersMap: Map<string, ControllerContainer>;

  constructor(root: Array<ConstructableFunc<ModuleMetadata>>) {
    this.#controllersMap = new Map<string, ControllerContainer>();
    this.#init(root);
  }

  #init(root: Array<ConstructableFunc<ModuleMetadata>>) {
    const injector = new Injector();
    // Resolve all dependencies
    root.forEach((module) => {
      const k = injector.resolveDependencies<ModuleMetadata>(module);
      this.#addToControllerMap(k.controllers);
    });
  }

  #addToControllerMap(ctrls: Array<ControllerContainer>): void {
    ctrls.forEach((ctrl) => {
      this.#controllersMap.set(ctrl.meta.prefix, ctrl);
    });
  }

  getControllers(): Map<string, ControllerContainer> {
    return this.#controllersMap;
  }
}
