import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Role } from '@prisma/client';

import { IsString, IsOptional } from 'class-validator';

export class CreateRoleDto {
  @IsString()
  roleName: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateRoleDto {
  @IsOptional()
  @IsString()
  roleName?: string;

  @IsOptional()
  @IsString()
  description?: string;
}

@Injectable()
export class RoleService {
  constructor(private prisma: PrismaService) { }

  async findAll(): Promise<Role[]> {
    return this.prisma.role.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number): Promise<Role> {
    const role = await this.prisma.role.findUnique({
      where: { id },
    });

    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }

    return role;
  }

  async findByName(roleName: string): Promise<Role | null> {
    return this.prisma.role.findUnique({
      where: { roleName },
    });
  }

  async create(data: CreateRoleDto): Promise<Role> {
    if (!data.roleName) {
      throw new BadRequestException('Role name is required');
    }

    const existingRole = await this.findByName(data.roleName);
    if (existingRole) {
      throw new BadRequestException('Role already exists');
    }

    return this.prisma.role.create({
      data: {
        roleName: data.roleName,
        description: data.description,
      },
    });
  }

  async update(id: number, data: UpdateRoleDto): Promise<Role> {
    const role = await this.findOne(id);

    if (data.roleName && data.roleName !== role.roleName) {
      const existingRole = await this.findByName(data.roleName);
      if (existingRole) {
        throw new BadRequestException('Role name already in use');
      }
    }

    return this.prisma.role.update({
      where: { id },
      data: {
        ...(data.roleName && { roleName: data.roleName }),
        ...(data.description && { description: data.description }),
      },
    });
  }

  async delete(id: number): Promise<Role> {
    const role = await this.findOne(id);

    return this.prisma.role.delete({
      where: { id },
    });
  }
}
