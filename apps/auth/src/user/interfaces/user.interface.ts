import { User } from '@app/common/prisma/generated/prisma';

export type PublicUser = Omit<User, 'password'>;
