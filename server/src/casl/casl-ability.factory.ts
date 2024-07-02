import {
  Ability,
  AbilityBuilder,
  AbilityClass,
  ExtractSubjectType,
  InferSubjects,
} from '@casl/ability';
import { Injectable } from '@nestjs/common';
import { JwtAccessTokenInput } from '../auth/dto/jwtToken.input';
import { Role, UserRoles } from '../role/entities/role.entity';
import { User } from '../user/entities/user.entity';
import { Action } from './types';
import { hasRole } from './utils/hasRole.utils';

type Subjects = InferSubjects<typeof User | typeof Role> | 'all';

export type AppAbility = Ability<[Action, Subjects]>;

@Injectable()
export class CaslAbilityFactory {
  createForUser(user: JwtAccessTokenInput) {
    const {
      can: allow,
      cannot: forbid,
      build,
    } = new AbilityBuilder<Ability<[Action, Subjects]>>(
      Ability as AbilityClass<AppAbility>,
    );

    if (hasRole(user.roles, UserRoles.ADMIN)) {
      allow(Action.Manage, 'all');
    } else {
      forbid(Action.Manage, 'all');

      allow(Action.Read, User, { id: user.sub });
      allow(Action.Update, User, { id: user.sub });
    }

    return build({
      detectSubjectType: (item) =>
        item.constructor as ExtractSubjectType<Subjects>,
    });
  }
}
