import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PublicUser } from './user/interfaces/user.interface';
import { UserService } from './user/user.service';
import { User } from '@app/common/prisma/generated/prisma';
import { toProtoUser } from './user/user.mapper';

describe('AuthController', () => {
  let authController: AuthController;
  const authService = { login: jest.fn() };
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

  describe('login', () => {
    it('returns the token from AuthService for the authenticated user', async () => {
      authService.login.mockResolvedValue({ token: 'jwt-token' });

      await expect(authController.login(userWithPassword)).resolves.toEqual({
        token: 'jwt-token',
      });
      expect(authService.login).toHaveBeenCalledWith(userWithPassword);
    });
  });

  describe('authenticate', () => {
    it('returns the user attached by the jwt guard', () => {
      expect(authController.authenticate(userWithPassword)).toEqual(
        toProtoUser(publicUser),
      );
    });
  });

  describe('createUser', () => {
    it('delegates to UserService.create', async () => {
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
  });

  describe('deleteUser', () => {
    it('delegates to UserService.deleteUser with the payload id', async () => {
      userService.deleteUser.mockResolvedValue(userWithPassword);

      await expect(
        authController.deleteUser({ userId: 'user-1' }),
      ).resolves.toEqual(toProtoUser(publicUser));
      expect(userService.deleteUser).toHaveBeenCalledWith('user-1');
    });
  });
});
