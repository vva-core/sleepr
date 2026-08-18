import { Module } from '@nestjs/common';
import { AuthDatabaseModule } from '../database/auth-database.module';
import { RefreshTokenRepository } from './refresh-token.repository';
import { RefreshTokenService } from './refresh-token.service';

@Module({
  imports: [AuthDatabaseModule],
  providers: [RefreshTokenService, RefreshTokenRepository],
  exports: [RefreshTokenService],
})
export class RefreshTokenModule {}
