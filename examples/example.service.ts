import { Injectable } from '../common/decorators/injectable.ts';

@Injectable()
export class ExampleService {
  constructor() {
    console.log('ExampleService is created');
  }
  public ex1(): Promise<string> {
    return new Promise((resolve) => {
      resolve('this is from service.ex1');
    });
  }
}
