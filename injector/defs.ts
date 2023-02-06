import { ControllerMetadata } from '../common/decorators/controller.ts';
import { ConstructableFunc } from '../defs.ts';

export interface ControllerContainer {
  origin: ConstructableFunc;
  instance: () => unknown;
  meta: ControllerMetadata;
}
