import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  getRequest(context: ExecutionContext) {
    if (context.getType() === 'rpc') {
      const request = context.switchToRpc().getData();
      // passport-local only reads request.body/request.query
      request.body = { email: request.email, password: request.password };
      return request;
    }

    return context.switchToHttp().getRequest();
  }
}
