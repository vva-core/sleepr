import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { RefreshTokenService } from './refresh-token/refresh-token.service';
import { PublicUser } from './user/interfaces/user.interface';

jest.mock('node:crypto', () => ({
  ...jest.requireActual('node:crypto'),
  randomUUID: () => 'fixed-jti',
}));

describe('AuthService', () => {
  let service: AuthService;
  const jwtService = { signAsync: jest.fn(), decode: jest.fn() };
  const configService = { getOrThrow: jest.fn() };
  const refreshTokenService = { issue: jest.fn(), revoke: jest.fn() };

  const user: PublicUser = {
    id: 'user-1',
    email: 'test@example.com',
    createdAt: new Date(),
    updatedAt: new Date(),
    roles: [],
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    jwtService.signAsync
      .mockResolvedValueOnce('access-token')
      .mockResolvedValueOnce('refresh-token');
    jwtService.decode.mockReturnValue({ exp: 1000 });
    configService.getOrThrow.mockImplementation((key: string) =>
      key === 'JWT_REFRESH_SECRET' ? 'refresh-secret' : '7d',
    );

    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: JwtService, useValue: jwtService },
        { provide: ConfigService, useValue: configService },
        { provide: RefreshTokenService, useValue: refreshTokenService },
      ],
    }).compile();
    service = moduleRef.get(AuthService);
  });

  describe('login', () => {
    it('returns an access + refresh token pair', async () => {
      await expect(service.login(user)).resolves.toEqual({
        token: 'access-token',
        refreshToken: 'refresh-token',
      });
    });

    it('persists the refresh token under its jti with the exp-derived expiry', async () => {
      await service.login(user);

      expect(refreshTokenService.issue).toHaveBeenCalledWith(
        'fixed-jti',
        'user-1',
        'refresh-token',
        new Date(1000 * 1000),
      );
    });

    it('signs the refresh token with the jti as its jwtid', async () => {
      await service.login(user);

      expect(jwtService.signAsync).toHaveBeenNthCalledWith(
        2,
        { sub: 'user-1', email: 'test@example.com' },
        expect.objectContaining({
          jwtid: 'fixed-jti',
          secret: 'refresh-secret',
        }),
      );
    });
  });

  describe('refresh', () => {
    it('revokes the old jti before issuing a new pair', async () => {
      await service.refresh(user, 'old-jti');

      expect(refreshTokenService.revoke).toHaveBeenCalledWith('old-jti');
      expect(
        refreshTokenService.revoke.mock.invocationCallOrder[0],
      ).toBeLessThan(refreshTokenService.issue.mock.invocationCallOrder[0]);
    });

    it('returns a fresh token pair', async () => {
      await expect(service.refresh(user, 'old-jti')).resolves.toEqual({
        token: 'access-token',
        refreshToken: 'refresh-token',
      });
    });
  });

  describe('logout', () => {
    it('revokes the token and reports success', async () => {
      await expect(service.logout('jti-1')).resolves.toEqual({
        success: true,
      });
      expect(refreshTokenService.revoke).toHaveBeenCalledWith('jti-1');
    });
  });
});
