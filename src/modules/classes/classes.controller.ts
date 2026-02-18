import { 
  Controller, Get, Post, Put, Delete, Body, Param, 
  HttpCode, HttpStatus, UsePipes, ValidationPipe 
} from '@nestjs/common';
import { ClassesService } from './classes.service';
import { CreateClassDto, UpdateClassDto, MemberDto, UpdateMemberRoleDto } from './dto/create-class.dto';

@Controller('api/classes')
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  async create(@Body() createClassDto: CreateClassDto) {
    return await this.classesService.create(createClassDto);
  }

  @Get()
  async findAll() {
    return await this.classesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.classesService.findOne(id);
  }

  @Get('code/:code')
  async findByCode(@Param('code') code: string) {
    return await this.classesService.findByCode(code);
  }

  @Put(':id')
  @UsePipes(new ValidationPipe({ transform: true }))
  async update(@Param('id') id: string, @Body() updateClassDto: UpdateClassDto) {
    return await this.classesService.update(id, updateClassDto);
  }

  @Post(':id/members')
  @UsePipes(new ValidationPipe({ transform: true }))
  async addMember(@Param('id') id: string, @Body() memberDto: MemberDto) {
    return await this.classesService.addMember(id, memberDto);
  }

  @Delete(':id/members/:memberId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeMember(@Param('id') id: string, @Param('memberId') memberId: string) {
    return await this.classesService.removeMember(id, memberId);
  }

  @Put(':id/members/:memberId')
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateMemberRole(
    @Param('id') id: string,
    @Param('memberId') memberId: string,
    @Body() updateRoleDto: UpdateMemberRoleDto,
  ) {
    return await this.classesService.updateMemberRole(id, memberId, updateRoleDto.role);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string) {
    return await this.classesService.delete(id);
  }

  @Post('initialize')
  async initializeDefaultClasses() {
    await this.classesService.initializeDefaultClasses();
    return { message: 'Default classes initialized successfully' };
  }
}