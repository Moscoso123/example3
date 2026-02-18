import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ClassesModule } from './modules/classes/classes.module';
import { ClassesService } from './modules/classes/classes.service';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      url: process.env.MYSQL_URL || process.env.MYSQL_PUBLIC_URL,
      autoLoadEntities: true,
      synchronize: true, // Set to false in production
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      serveRoot: '/',
    }),
    UsersModule,
    ClassesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements OnModuleInit {
  constructor(private classesService: ClassesService) {}

  async onModuleInit() {
    // Initialize default classes when the app starts
    await this.classesService.initializeDefaultClasses();
  }
}