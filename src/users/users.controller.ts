import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './users.dto';
import { Users } from './users.entity';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Insert user
  @Post('users')
  async insert(@Body() body: { name: string; email: string }): Promise<Users> {
    return this.usersService.insert(body);
  }

  // Display all users
  @Get('display')
  async findAll(): Promise<Users[]> {
    const users = await this.usersService.findAll();
    return users || []; // always return array
  }

  // Get single user
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Users> {
    return this.usersService.findOne(+id);
  }

  // Update user
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<Users> {
    return this.usersService.update(+id, updateUserDto);
  }

  // Delete user
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<{ message: string }> {
    await this.usersService.delete(+id);
    return { message: 'User deleted successfully' };
  }
}
