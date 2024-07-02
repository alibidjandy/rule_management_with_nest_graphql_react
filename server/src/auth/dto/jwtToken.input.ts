import { InputType } from '@nestjs/graphql';
import { UserRoles } from '../../role/entities/role.entity';

@InputType()
export class JwtAccessTokenInput {
  sub: string;
  email: string;
  roles?: UserRoles[];
  iat?: number;
  exp?: number;
}

@InputType()
export class JwtRefreshTokenInput extends JwtAccessTokenInput {
  access_token: string;
}
