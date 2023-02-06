/*
Copyright © 2020 Jonas Auer <hello@jonasauer.dev>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the “Software”), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

// Original source is from https://github.com/cmd-johnson/deno-dependency-injector.
// To printing routes out while resolving dependencies, copy and modification is nessesary instead of import.

import { ControllerMetadata } from '../common/decorators/controller.ts';
import { ModuleMetadata } from '../common/decorators/index.ts';
import { CONTROLLER_META_PROPKEY, MetaKeys } from '../constants.ts';
import { ConstructableFunc } from '../defs.ts';
import { Reflect } from '../deps.ts';
import { ControllerContainer } from './defs.ts';

export interface InjectionMetadata {
  isSingleton: boolean;
}

export function setInjectionMetadata(Type: ConstructableFunc, metadata: InjectionMetadata) {
  Reflect.defineMetadata(CONTROLLER_META_PROPKEY, metadata, Type);
}

export function bootstrap<T>(
  Type: ConstructableFunc<T>,
  overrides = new Map<ConstructableFunc, ConstructableFunc>()
): T {
  return new Injector(overrides).bootstrap(Type);
}

export class Injector {
  private resolved = new Map<ConstructableFunc, () => unknown>();

  constructor(private overrides = new Map<ConstructableFunc, ConstructableFunc>()) {}

  public resolveDependencies<T>(Type: ConstructableFunc<T>): {
    controllers: Array<ControllerContainer>;
  } {
    const moduleMeta = Reflect.getOwnMetadata(MetaKeys.MODULE, Type) as ModuleMetadata;
    console.log(`Module ${Type.name} is resolved.`);

    return {
      controllers: (moduleMeta.controllers || [])?.reduce((prev, curr): Array<ControllerContainer> => {
        this.resolve([curr]);
        const k = this.resolved.get(curr);
        if (!k) {
          return prev;
        }
        const meta = Reflect.getOwnMetadata(CONTROLLER_META_PROPKEY, curr) as ControllerMetadata;
        prev.push({ origin: curr, instance: k, meta });
        return prev;
      }, [] as Array<ControllerContainer>),
    };
  }

  public bootstrap<T>(Type: ConstructableFunc<T>): T {
    if (this.isInjectable(Type)) {
      this.resolve([Type]);
      return this.resolved.get(Type)!() as T;
    } else {
      const dependencies = this.getDependencies(Type);
      this.resolve(dependencies);

      return new Type(...dependencies.map((Dep) => this.resolved.get(Dep)!()));
    }
  }

  private resolve(Types: ConstructableFunc[]): void {
    const unresolved = new Map([...this.discoverDependencies(Types)].filter(([T]) => !this.resolved.has(T)));

    while (unresolved.size > 0) {
      const nextResolvable = [...unresolved].find(([, meta]) =>
        meta.dependencies.every((dep) => this.resolved.has(dep))
      );
      if (!nextResolvable) {
        const unresolvable = [...unresolved]
          .map(([Type, { dependencies }]) => `${Type.name} (-> ${dependencies.map((D) => D.name).join(',')})`)
          .join(', ');
        throw new Error(`Dependency cycle detected: Failed to resolve ${unresolvable}`);
      }
      const [Next, meta] = nextResolvable;

      const createInstance = () =>
        new Next(...meta.dependencies.map((Dep) => this.resolved.get(Dep)!())) as typeof Next;

      const instance = createInstance();
      this.resolved.set(Next, () => instance);
      unresolved.delete(Next);
    }
  }

  private getInjectionMetadata(Type: ConstructableFunc): InjectionMetadata {
    const metadata: InjectionMetadata | undefined = Reflect.getOwnMetadata(CONTROLLER_META_PROPKEY, Type);
    if (!metadata) {
      throw new TypeError(`Type ${Type.name} is not injectable`);
    }
    return metadata;
  }

  private isInjectable(Type: ConstructableFunc): boolean {
    return typeof Reflect.getOwnMetadata(CONTROLLER_META_PROPKEY, Type) === 'object';
  }

  private getDependencies(Type: ConstructableFunc): ConstructableFunc[] {
    const dependencies: ConstructableFunc[] = Reflect.getOwnMetadata('design:paramtypes', Type) || [];

    return dependencies.map((Dep) => {
      if (this.overrides.has(Dep) && this.overrides.get(Dep) !== Type) {
        return this.overrides.get(Dep)!;
      } else {
        return Dep;
      }
    });
  }

  private discoverDependencies(
    Types: ConstructableFunc[]
  ): Map<ConstructableFunc, InjectionMetadata & { dependencies: ConstructableFunc[] }> {
    const discovered = new Map<ConstructableFunc, InjectionMetadata & { dependencies: ConstructableFunc[] }>();
    const undiscovered = new Set(Types);

    while (undiscovered.size > 0) {
      const Next = [...undiscovered.keys()][0];
      const dependencies = this.getDependencies(Next);
      const metadata = this.getInjectionMetadata(Next);

      dependencies
        .filter((Dep) => !discovered.has(Dep))
        .forEach((Dep) => {
          if (!this.isInjectable(Dep)) {
            throw new TypeError(`Dependency ${Dep.name} of ${Next.name} is not injectable`);
          }
          undiscovered.add(Dep);
        });

      undiscovered.delete(Next);
      discovered.set(Next, {
        ...metadata,
        dependencies,
      });
    }

    return discovered;
  }
}
