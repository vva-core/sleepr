import { UnauthorizedException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as bcrypt from 'bcryptjs';
import { RefreshToken } from '../prisma/generated';
import { RefreshTokenService } from './refresh-token.service';
import { RefreshTokenRepository } from './refresh-token.repository';

jest.mock('bcryptjs');

describe('RefreshTokenService', () => {
  let service: RefreshTokenService;
  const repository = {
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  };

  const storedToken: RefreshToken = {
    id: 'jti-1',
    userId: 'user-1',
    tokenHash: 'stored-hash',
    expiresAt: new Date(Date.now() + 60_000),
    revokedAt: null,
    createdAt: new Date(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        RefreshTokenService,
        { provide: RefreshTokenRepository, useValue: repository },
      ],
    }).compile();
    service = moduleRef.get(RefreshTokenService);
  });

  describe('issue', () => {
    it('hashes the raw token and persists it keyed by the jti', async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
      const expiresAt = new Date(Date.now() + 1000);

      await service.issue('jti-1', 'user-1', 'raw-token', expiresAt);

      expect(bcrypt.hash).toHaveBeenCalledWith('raw-token', 10);
      expect(repository.create).toHaveBeenCalledWith({
        id: 'jti-1',
        userId: 'user-1',
        tokenHash: 'hashed',
        expiresAt,
      });
    });
  });

  describe('validate', () => {
    it('resolves for a live, matching token', async () => {
      repository.findOne.mockResolvedValue(storedToken);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await expect(service.validate('jti-1', 'raw')).resolves.toBeUndefined();
    });

    it('throws when the jti is unknown', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.validate('jti-x', 'raw')).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });

    it('throws when the token is revoked', async () => {
      repository.findOne.mockResolvedValue({
        ...storedToken,
        revokedAt: new Date(),
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await expect(service.validate('jti-1', 'raw')).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });

    it('throws when the token is expired', async () => {
      repository.findOne.mockResolvedValue({
        ...storedToken,
        expiresAt: new Date(Date.now() - 1000),
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await expect(service.validate('jti-1', 'raw')).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });

    it('throws when the token hash does not match', async () => {
      repository.findOne.mockResolvedValue(storedToken);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.validate('jti-1', 'wrong')).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });
  });

  describe('revoke', () => {
    it('stamps revokedAt on the row', async () => {
      await service.revoke('jti-1');

      expect(repository.update).toHaveBeenCalledWith('jti-1', {
        revokedAt: expect.any(Date),
      });
    });
  });
});
