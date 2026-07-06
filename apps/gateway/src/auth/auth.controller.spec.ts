import { Test, TestingModule } from '@nestjs/testing';
import { AUTH_SERVICE_NAME } from '@app/common/types/proto/auth';
import { UnauthorizedException } from '@nestjs/common';
import { firstValueFrom, of, throwError } from 'rxjs';
import type { Response } from 'express';
import { AuthController } from './auth.controller';

describe('Gateway AuthController', () => {
  let controller: AuthController;
  const authClient = { login: jest.fn() };
  const clientGrpc = { getService: jest.fn() };
  const response = { cookie: jest.fn() } as unknown as Response;

  beforeEach(async () => {
    jest.clearAllMocks();
    clientGrpc.getService.mockReturnValue(authClient);
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AUTH_SERVICE_NAME, useValue: clientGrpc }],
    }).compile();

    controller = app.get<AuthController>(AuthController);
    controller.onModuleInit();
  });

  it('sets the Authentication cookie and returns the token', async () => {
    authClient.login.mockReturnValue(of({ token: 'jwt-token' }));

    const result = await firstValueFrom(
      controller.login(
        { email: 'test@example.com', password: 'StrongPass1!' },
        response,
      ),
    );

    expect(result).toEqual({ token: 'jwt-token' });
    expect(response.cookie).toHaveBeenCalledWith(
      'Authentication',
      'jwt-token',
      { httpOnly: true },
    );
  });

  it('maps gRPC login failures to 401', async () => {
    authClient.login.mockReturnValue(
      throwError(() => new Error('invalid credentials')),
    );

    await expect(
      firstValueFrom(
        controller.login(
          { email: 'test@example.com', password: 'wrong' },
          response,
        ),
      ),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(response.cookie).not.toHaveBeenCalled();
  });
});
