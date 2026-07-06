import {
  AUTH_SERVICE_NAME,
  type AuthServiceClient,
} from '@app/common/types/proto/auth';
import {
  Body,
  Controller,
  Inject,
  OnModuleInit,
  Post,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import type { Response } from 'express';
import { catchError, map } from 'rxjs';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController implements OnModuleInit {
  private authClient: AuthServiceClient;

  constructor(@Inject(AUTH_SERVICE_NAME) private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.authClient =
      this.client.getService<AuthServiceClient>(AUTH_SERVICE_NAME);
  }

  @Post('login')
  login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authClient.login(loginDto).pipe(
      map(({ token }) => {
        response.cookie('Authentication', token, {
          httpOnly: true,
        });
        return { token };
      }),
      catchError(() => {
        throw new UnauthorizedException();
      }),
    );
  }
}
