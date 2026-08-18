import { User } from '../../prisma/generated';

export type PublicUser = Omit<User, 'password'>;
