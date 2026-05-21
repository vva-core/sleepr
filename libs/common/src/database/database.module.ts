import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export * from './base.interface';
export * from '../prisma/prisma.service';

@Module({
  imports: [
    PrismaModule,
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.getOrThrow('MYSQL_HOST'),
        port: configService.getOrThrow<number>('MYSQL_PORT'),
        username: configService.getOrThrow('MYSQL_USER'),
        password: configService.getOrThrow('MYSQL_PASSWORD'),
        database: configService.getOrThrow('MYSQL_DATABASE'),
        synchronize: true,
        autoLoadEntities: true,
      }),
      inject: [ConfigService],
    }),
  ],
  exports: [PrismaModule],
})
export class DatabaseModule {
  static forFeature(entities: any[]) {
    return TypeOrmModule.forFeature(entities);
  }
}
