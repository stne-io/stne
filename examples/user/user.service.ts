import { Injectable } from '../../common/decorators/injectable.ts';
import { Users } from './user.ts';

@Injectable()
export class UserService {
  constructor() {
    console.log('user service constructor');
  }

  public getUser(): Users {
    return new Users('id1', 'innfi@test.com', 'innfi');
  }
}
