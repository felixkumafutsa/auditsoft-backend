
// src/common/decorators/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';
// src/common/guards/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
    
    // If no roles are specified, allow access
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user; // Assumes user is attached to request by auth middleware

    if (!user || !user.roles) {
      throw new ForbiddenException('User information not found');
    }

    const userRoles = Array.isArray(user.roles) ? user.roles : [user.roles];
    const hasRole = () => userRoles.some(role => requiredRoles.includes(role));

    if (!hasRole()) {
      throw new ForbiddenException(
        `User with roles [${userRoles.join(', ')}] does not have access to this resource. Required roles: [${requiredRoles.join(', ')}]`
      );
    }

    return true;
  }
}

export const Roles = (...roles: string[]) => SetMetadata('roles', roles);
