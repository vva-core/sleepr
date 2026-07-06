import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from '@app/common';

export class UpdateUserDto extends PartialType(CreateUserDto) {}
