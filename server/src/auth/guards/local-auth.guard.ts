import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs/internal/Observable';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  constructor(private reflector: Reflector) {
    super();
  }
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.getAllAndOverride('isPublic', [
      // Look for "isPublic" metadata on a method
      context.getHandler(),
      // Look for "isPublic" metadata on a class
      context.getClass(),
    ]);

    // Pass auth guard
    if (isPublic) return true;

    // Execute the guard with the relevant strategy
    return super.canActivate(context);
  }
}
