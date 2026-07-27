import { Module } from '@nestjs/common';
import { DatabaseModule } from '@app/common';
import { RefreshTokenRepository } from './refresh-token.repository';
import { RefreshTokenService } from './refresh-token.service';

@Module({
  imports: [DatabaseModule],
  providers: [RefreshTokenService, RefreshTokenRepository],
  exports: [RefreshTokenService],
})
export class RefreshTokenModule {}
