import { Module } from '../common/decorators/index.ts';
import { ExampleController } from './example.controller.ts';

@Module({
  controllers: [ExampleController],
})
export class GlobalModules {
  constructor() {
    console.log('GlobalModules is created!');
  }
}
