import { Reflect } from '../../deps.ts';
import { ConstructableFunc, Type } from '../../defs.ts';
import { MetaKeys } from '../../constants.ts';

export interface ModuleMetadata {
  imports?: Array<Type>;
  controllers?: Type[];
  providers?: Type[];
}

export function Module<T>(metadata: ModuleMetadata) {
  return (target: ConstructableFunc<T>): void => {
    Reflect.defineMetadata(MetaKeys.MODULE, metadata, target);
  };
}
