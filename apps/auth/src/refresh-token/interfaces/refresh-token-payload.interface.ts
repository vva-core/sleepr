import { TokenPayload } from '../../user/interfaces/token-payload.interface';

export interface RefreshTokenPayload extends TokenPayload {
  jti: string;
}
