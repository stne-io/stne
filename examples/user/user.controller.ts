import { Body, Header, Query } from '../../common/decorators/http/route.param.ts';
import { ApiEndpoint, Controller, Param } from '../../common/decorators/index.ts';
import { HttpMethod } from '../../defs.ts';
import { Users } from './user.ts';
import { UserService } from './user.service.ts';

@Controller('/user')
export class UserController {
  constructor(public serivce: UserService) {
    console.log('user controller constructor');
  }

  @ApiEndpoint('', HttpMethod.GET)
  public getUserDefault(): Users {
    return this.serivce.getUser();
  }
}
