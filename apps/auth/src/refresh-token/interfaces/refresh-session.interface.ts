import { PublicUser } from '../../user/interfaces/user.interface';

export interface RefreshSession {
  user: PublicUser;
  jti: string;
}
