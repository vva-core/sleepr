import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RefreshSession } from '../interfaces/refresh-session.interface';

export const CurrentRefreshSession = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): RefreshSession =>
    ctx.switchToHttp().getRequest().user,
);
