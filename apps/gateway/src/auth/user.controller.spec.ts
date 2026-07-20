import { Test, TestingModule } from '@nestjs/testing';
import { JwtAuthGuard } from '@app/common/auth';
import { AUTH_SERVICE_NAME, type User } from '@app/common/types/proto/auth';
import { firstValueFrom, of } from 'rxjs';
import { UserController } from './user.controller';

describe('Gateway UserController', () => {
  let controller: UserController;
  const authClient = { createUser: jest.fn(), deleteUser: jest.fn() };
  const clientGrpc = { getService: jest.fn() };

  const user = { id: 'user-1', email: 'test@example.com' } as User;

  beforeEach(async () => {
    jest.clearAllMocks();
    clientGrpc.getService.mockReturnValue(authClient);
    const app: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [{ provide: AUTH_SERVICE_NAME, useValue: clientGrpc }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = app.get<UserController>(UserController);
    controller.onModuleInit();
  });

  it('creates users through the auth client', async () => {
    authClient.createUser.mockReturnValue(of(user));

    await expect(
      firstValueFrom(
        controller.create({
          email: 'test@example.com',
          password: 'StrongPass1!',
        }),
      ),
    ).resolves.toEqual(user);
    expect(authClient.createUser).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'StrongPass1!',
    });
  });

  it('returns the current user without extra gRPC calls', () => {
    expect(controller.getUser(user)).toEqual(user);
    expect(authClient.createUser).not.toHaveBeenCalled();
    expect(authClient.deleteUser).not.toHaveBeenCalled();
  });

  it('deletes the current user by id', async () => {
    authClient.deleteUser.mockReturnValue(of(user));

    await expect(firstValueFrom(controller.deleteUser(user))).resolves.toEqual(
      user,
    );
    expect(authClient.deleteUser).toHaveBeenCalledWith({ userId: 'user-1' });
  });
});
