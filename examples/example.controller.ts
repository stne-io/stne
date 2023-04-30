import { Body, Header, Query } from '../common/decorators/http/route.param.ts';
import { ApiEndpoint, Controller, Param } from '../common/decorators/index.ts';
import { HttpMethod } from '../defs.ts';
import { ExampleService } from './example.service.ts';

@Controller('/stne')
export class ExampleController {
  constructor(public service: ExampleService) {
    console.log('ExampleController is created!');
  }

  @ApiEndpoint('/getTest', HttpMethod.GET)
  public bbb(): Promise<string> {
    return new Promise((resolve) => {
      resolve('bbb');
    });
  }

  @ApiEndpoint('/getTest2', HttpMethod.GET)
  public async ccc(): Promise<string> {
    return await this.service.ex1();
  }

  @ApiEndpoint('/postTest', HttpMethod.POST)
  public async postTest(): Promise<string> {
    return await this.service.ex1();
  }

  @ApiEndpoint('/getTest3/:id', HttpMethod.GET)
  public getTest3(
    @Param('id') id: number,
    // deno-lint-ignore no-explicit-any
    @Header('accept') header: any,
    @Query('name') name: string,
  ): Promise<string> {
    console.log('accept', header);
    return this.service.getThree(id, name);
  }

  @ApiEndpoint('/postTest1/:id', HttpMethod.POST)
  // deno-lint-ignore no-explicit-any
  public postTest1(@Body() body: any): Promise<string> {
    return new Promise((resolve) => {
      resolve(`postTest1 ${body}`);
    });
  }
}
