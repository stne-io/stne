import { CONTROLLER_META_PROPKEY } from '../../constants.ts';
import { ConstructableFunc } from '../../defs.ts';
import { Reflect } from '../../deps.ts';

export interface InjectionOptions {
  isSingleton: boolean;
}

export function Injectable<T>(options: InjectionOptions = { isSingleton: true }) {
  return (target: ConstructableFunc<T>): void => {
    Reflect.defineMetadata(CONTROLLER_META_PROPKEY, options, target);
  };
}
