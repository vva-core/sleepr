import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '../prisma/generated/prisma';

export const CurrentUser = createParamDecorator<User>(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
