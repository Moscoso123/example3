import { Module } from '@nestjs/common';
import { UsersController } from './users/users.controller';
import { UsersService } from './users/users.service';
import {TypeOrmModule} from '@nestjs/typeorm';
import { Users } from './users/users.entity';

@Module({
  imports: [
  TypeOrmModule.forRoot({
  type: 'mysql',
  port: 3306,
  username: 'root',
  database: 'market',
  password: '',
  entities: [Users],
  synchronize: true,
   }),
       TypeOrmModule.forFeature([Users]), 
  ],
   controllers: [UsersController],
  providers: [UsersService],
})
export class AppModule {}
