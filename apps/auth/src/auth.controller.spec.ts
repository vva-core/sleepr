import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PublicUser } from './user/interfaces/user.interface';
import { UserService } from './user/user.service';
import { User } from '@app/common/prisma/generated/prisma';
import { toProtoUser } from './user/user.mapper';
import { RefreshSession } from './refresh-token/interfaces/refresh-session.interface';

describe('AuthController', () => {
  let authController: AuthController;
  const authService = {
    login: jest.fn(),
    refresh: jest.fn(),
    logout: jest.fn(),
  };
  const userService = { create: jest.fn(), deleteUser: jest.fn() };

  const publicUser: PublicUser = {
    id: 'user-1',
    email: 'test@example.com',
    createdAt: new Date(),
    updatedAt: new Date(),
    roles: [],
  };

  const userWithPassword: User = {
    ...publicUser,
    password: 'hashed-password',
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: UserService, useValue: userService },
      ],
    }).compile();

    authController = app.get<AuthController>(AuthController);
  });

  it('login delegates to authService.login', async () => {
    authService.login.mockResolvedValue({ token: 'jwt-token' });

    await expect(authController.login(userWithPassword)).resolves.toEqual({
      token: 'jwt-token',
    });
    expect(authService.login).toHaveBeenCalledWith(userWithPassword);
  });

  it('authenticate delegates to toProtoUser', () => {
    expect(authController.authenticate(userWithPassword)).toEqual(
      toProtoUser(publicUser),
    );
  });

  it('refresh delegates to authService.refresh', async () => {
    const session: RefreshSession = { user: publicUser, jti: 'jti-1' };
    authService.refresh.mockResolvedValue({
      token: 'access',
      refreshToken: 'refresh',
    });

    await expect(authController.refresh(session)).resolves.toEqual({
      token: 'access',
      refreshToken: 'refresh',
    });
    expect(authService.refresh).toHaveBeenCalledWith(publicUser, 'jti-1');
  });

  it('logout delegates to authService.logout', async () => {
    const session: RefreshSession = { user: publicUser, jti: 'jti-1' };
    authService.logout.mockResolvedValue({ success: true });

    await expect(authController.logout(session)).resolves.toEqual({
      success: true,
    });
    expect(authService.logout).toHaveBeenCalledWith('jti-1');
  });

  it('createUser delegates to userService.create', async () => {
    userService.create.mockResolvedValue(userWithPassword);

    await expect(
      authController.createUser({
        email: 'test@example.com',
        password: 'StrongPass1!',
      }),
    ).resolves.toEqual(toProtoUser(publicUser));
    expect(userService.create).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'StrongPass1!',
    });
  });

  it('deleteUser delegates to userService.deleteUser', async () => {
    userService.deleteUser.mockResolvedValue(userWithPassword);

    await expect(
      authController.deleteUser({ userId: 'user-1' }),
    ).resolves.toEqual(toProtoUser(publicUser));
    expect(userService.deleteUser).toHaveBeenCalledWith('user-1');
  });
});
