import { Controller, Get, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { Response } from 'express';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // Example API
  @Get('api/hello')
  getHello(): string {
    return this.appService.getHello();
  }

  // Serve index.html manually (optional if not using ServeStaticModule)
  @Get()
  serveIndex(@Res() res: Response) {
    const html = this.appService.getIndexHtml();
    res.type('html').send(html);
  }
}