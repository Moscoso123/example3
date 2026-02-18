import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Class, Member } from './entities/classes.entity';
import { CreateClassDto, UpdateClassDto, MemberDto } from './dto/create-class.dto';

@Injectable()
export class ClassesService {
  constructor(
    @InjectRepository(Class)
    private classRepository: Repository<Class>,
  ) {}

  async create(createClassDto: CreateClassDto): Promise<Class> {
    const existingClass = await this.classRepository.findOne({
      where: [
        { code: createClassDto.code },
        { name: createClassDto.name }
      ]
    });

    if (existingClass) {
      throw new BadRequestException('Class with this name or code already exists');
    }

    const newClass = this.classRepository.create({
      ...createClassDto,
      members: []
    });

    return await this.classRepository.save(newClass);
  }

  async initializeDefaultClasses(): Promise<void> {
    const defaultClasses = [
      { name: 'BSIT 2A', code: 'BSIT-2A' },
      { name: 'BSIT 2B', code: 'BSIT-2B' },
      { name: 'BSIT 2C', code: 'BSIT-2C' },
      { name: 'BSIT 2D', code: 'BSIT-2D' },
    ];

    for (const defaultClass of defaultClasses) {
      const exists = await this.classRepository.findOne({
        where: { code: defaultClass.code }
      });

      if (!exists) {
        await this.create({
          ...defaultClass,
          gitRepository: '',
          systemUrl: ''
        });
      }
    }
  }

  async findAll(): Promise<Class[]> {
    return await this.classRepository.find({
      order: { name: 'ASC' }
    });
  }

  async findOne(id: string): Promise<Class> {
    const classItem = await this.classRepository.findOne({ where: { id } });
    if (!classItem) {
      throw new NotFoundException('Class not found');
    }
    return classItem;
  }

  async findByCode(code: string): Promise<Class> {
    const classItem = await this.classRepository.findOne({ where: { code } });
    if (!classItem) {
      throw new NotFoundException('Class not found');
    }
    return classItem;
  }

  async update(id: string, updateClassDto: UpdateClassDto): Promise<Class> {
    const classItem = await this.findOne(id);
    
    Object.assign(classItem, updateClassDto);
    
    if (updateClassDto.members) {
      classItem.members = updateClassDto.members.map(member => ({
        id: uuidv4(),
        name: member.name,
        role: member.role || 'Member',
        classId: id,
      }));
    }
    
    return await this.classRepository.save(classItem);
  }

  async addMember(classId: string, memberDto: MemberDto): Promise<Member> {
    const classItem = await this.findOne(classId);
    
    const newMember: Member = {
      id: uuidv4(),
      name: memberDto.name,
      role: memberDto.role || 'Member',
      classId: classId,
    };
    
    if (!classItem.members) {
      classItem.members = [];
    }
    
    classItem.members.push(newMember);
    await this.classRepository.save(classItem);
    
    return newMember;
  }

  async removeMember(classId: string, memberId: string): Promise<void> {
    const classItem = await this.findOne(classId);
    
    if (!classItem.members) {
      throw new NotFoundException('No members found');
    }
    
    classItem.members = classItem.members.filter(m => m.id !== memberId);
    await this.classRepository.save(classItem);
  }

  async updateMemberRole(classId: string, memberId: string, role: string): Promise<Member> {
    const classItem = await this.findOne(classId);
    
    if (!classItem.members) {
      throw new NotFoundException('No members found');
    }
    
    const member = classItem.members.find(m => m.id === memberId);
    if (!member) {
      throw new NotFoundException('Member not found');
    }
    
    member.role = role;
    await this.classRepository.save(classItem);
    
    return member;
  }

  async delete(id: string): Promise<void> {
    const result = await this.classRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Class not found');
    }
  }
}