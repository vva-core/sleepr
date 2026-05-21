import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto } from './dto/create-user.dto';
import { UserRepository } from './user.new.repository';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async create(createUserDto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    console.log(`Creating user with email: ${createUserDto.email}`);
    console.log(`Hashed password: ${hashedPassword}`);

    return await this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });
  }

  async validateUser(email: string, password: string) {
    const user = await this.userRepository.findOne({ email });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  async getUser(id: number) {
    return await this.userRepository.findOne({ id });
  }

  async deleteUser(id: number) {
    return await this.userRepository.delete(id);
  }
}
