import { ApiEndpoint, Controller } from '../common/decorators/index.ts';
import { HttpMethod } from '../defs.ts';
import { ExampleService } from './example.service.ts';

@Controller('/aa')
export class ExampleController {
  constructor(public service: ExampleService) {
    console.log('ExampleController is created!');
  }

  @ApiEndpoint('/b', HttpMethod.GET)
  public bbb(): Promise<string> {
    return new Promise((resolve) => {
      resolve('bbb');
    });
  }

  @ApiEndpoint('/c', HttpMethod.GET)
  public async ccc(): Promise<string> {
    return await this.service.ex1();
  }
}
