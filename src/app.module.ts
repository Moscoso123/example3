import { Module, OnModuleInit, Logger } from '@nestjs/common';
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
      url: process.env.MYSQL_URL,
      autoLoadEntities: true,
      synchronize: true,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false, // For Railway
      extra: {
        connectionLimit: 10,
      },
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      serveRoot: '/',
    }),
    UsersModule,
    ClassesModule, // ✅ Import the module
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements OnModuleInit {
  private readonly logger = new Logger(AppModule.name);
  
  constructor(private classesService: ClassesService) {}

  async onModuleInit() {
    // Wait a bit for database connection
    setTimeout(async () => {
      try {
        this.logger.log('🚀 Initializing default classes...');
        await this.classesService.initializeDefaultClasses();
        this.logger.log('✅ Default classes initialized');
      } catch (error) {
        this.logger.error('❌ Failed to initialize classes:', error.message);
      }
    }, 3000);
  }
}