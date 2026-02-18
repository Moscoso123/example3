import { IsString, IsOptional, IsUrl, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateClassDto {
  @IsString()
  name: string;

  @IsString()
  code: string;

  @IsOptional()
  @IsUrl()
  gitRepository?: string;

  @IsOptional()
  @IsUrl()
  systemUrl?: string;
}

export class UpdateClassDto {
  @IsOptional()
  @IsUrl()
  gitRepository?: string;

  @IsOptional()
  @IsUrl()
  systemUrl?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MemberDto)
  members?: MemberDto[];
}

export class MemberDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  role?: string;
}

export class UpdateMemberRoleDto {
  @IsString()
  role: string;
}