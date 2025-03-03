import { User } from '../../../user/entities/user.entity';
import { AppAbility } from '../../casl-ability.factory';
import { Action, IPolicyHandler } from '../../types';

export class UpdateUserPolicyHandler implements IPolicyHandler {
  constructor(private requestedUserId: string) {}

  handle(ability: AppAbility) {
    if (!this.requestedUserId) return false;
    const mockedUser = new User();
    mockedUser.id = this.requestedUserId;
    return ability.can(Action.Update, mockedUser);
  }
}
