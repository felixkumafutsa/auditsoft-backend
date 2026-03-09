import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { User } from '@prisma/client';
import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';
import { IsString, IsEmail, IsOptional, IsBoolean, IsArray, IsNumber } from 'class-validator';

const scryptAsync = promisify(scrypt);

export class CreateUserDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsBoolean()
  mfaEnabled?: boolean;

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  auditUniverseEntityIds?: number[];
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsBoolean()
  mfaEnabled?: boolean;

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  auditUniverseEntityIds?: number[];

  @IsOptional()
  @IsString()
  profilePicture?: string;
}

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) { }

  private async hashPassword(password: string): Promise<string> {
    const salt = randomBytes(16).toString('hex');
    const hash = (await scryptAsync(password, salt, 64)) as Buffer;
    return `${salt}:${hash.toString('hex')}`;
  }

  async validatePassword(password: string, hash: string): Promise<boolean> {
    const [salt, storedHash] = hash.split(':');
    const newHash = (await scryptAsync(password, salt, 64)) as Buffer;
    return newHash.toString('hex') === storedHash;
  }

  async findAll(): Promise<any[]> {
    return this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        profilePicture: true,
        status: true,
        mfaEnabled: true,
        createdAt: true,
        updatedAt: true,
        userRoles: { include: { role: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number): Promise<Omit<User, 'passwordHash'>> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        profilePicture: true,
        status: true,
        mfaEnabled: true,
        createdAt: true,
        updatedAt: true,
        userRoles: { include: { role: true } },
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async findByEmail(email: string): Promise<any> {
    return this.prisma.user.findUnique({
      where: { email },
      include: { userRoles: { include: { role: true } } },
    });
  }

  async create(data: CreateUserDto): Promise<Omit<User, 'passwordHash'>> {
    if (!data.name || !data.email || !data.password) {
      throw new BadRequestException('Name, email, and password are required');
    }

    const existingUser = await this.findByEmail(data.email);
    if (existingUser) {
      throw new BadRequestException('Email already in use');
    }

    const passwordHash = await this.hashPassword(data.password);

    return this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash: passwordHash,
        profilePicture: (data as any).profilePicture || undefined,
        status: data.status || 'active',
        mfaEnabled: data.mfaEnabled || false,
      },
      select: {
        id: true,
        name: true,
        email: true,
        profilePicture: true,
        status: true,
        mfaEnabled: true,
        createdAt: true,
        updatedAt: true,
        userRoles: { include: { role: true } },
      },
    });
  }

  async update(id: number, data: UpdateUserDto): Promise<Omit<User, 'passwordHash'>> {
    await this.findOne(id); // Verify user exists

    if (data.email) {
      const existingUser = await this.findByEmail(data.email);
      if (existingUser && existingUser.id !== id) {
        throw new BadRequestException('Email already in use');
      }
    }

    let passwordHash: string | undefined = undefined;
    if (data.password) {
      passwordHash = await this.hashPassword(data.password);
    }

    return this.prisma.user.update({
      where: { id },
      data: {
        name: data.name,
        email: data.email,
        status: data.status,
        mfaEnabled: data.mfaEnabled,
        passwordHash: passwordHash,
        profilePicture: (data as any).profilePicture || undefined,
      },
      select: {
        id: true,
        name: true,
        email: true,
        profilePicture: true,
        status: true,
        mfaEnabled: true,
        createdAt: true,
        updatedAt: true,
        userRoles: { include: { role: true } },
      },
    });
  }

  async delete(id: number): Promise<Omit<User, 'passwordHash'>> {
    await this.findOne(id); // Verify user exists

    // Note: relational data like userRoles will be handled by Prisma's cascade rules if set
    return this.prisma.user.delete({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        profilePicture: true,
        status: true,
        mfaEnabled: true,
        createdAt: true,
        updatedAt: true,
        userRoles: { include: { role: true } },
      },
    });
  }

  async assignRole(userId: number, roleId: number): Promise<any> {
    await this.findOne(userId);

    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      throw new NotFoundException(`Role with ID ${roleId} not found`);
    }

    // Prevent duplicate role assignments
    const existingAssignment = await this.prisma.userRole.findUnique({
      where: { userId_roleId: { userId, roleId } },
    });

    if (existingAssignment) {
      throw new BadRequestException('User already has this role');
    }

    return this.prisma.userRole.create({
      data: {
        userId,
        roleId,
      },
      include: { user: { select: { id: true, name: true, email: true } }, role: true },
    });
  }

  async removeRole(userId: number, roleId: number): Promise<void> {
    const userRole = await this.prisma.userRole.findUnique({
      where: { userId_roleId: { userId, roleId } },
    });

    if (!userRole) {
      throw new NotFoundException(`User-Role relationship not found`);
    }

    await this.prisma.userRole.delete({
      where: { userId_roleId: { userId, roleId } },
    });
  }

  async getUserRoles(userId: number): Promise<any[]> {
    await this.findOne(userId);

    return this.prisma.userRole.findMany({
      where: { userId },
      include: { role: true },
    });
  }

  async getTasks(userId: number) {
    const userRoles = await this.prisma.userRole.findMany({
      where: { userId },
      include: { role: true },
    });
    const roleNames = userRoles.map(ur => ur.role?.roleName);
    const roleSet = new Set(roleNames);
    const isManager = roleSet.has('Audit Manager') || roleSet.has('Manager');
    const isCAE = roleSet.has('Chief Auditor');
    const isAuditor = roleSet.has('Auditor');

    const tasks: any[] = [];

    if (isAuditor) {
      const assignedAudits = await this.prisma.audit.findMany({
        where: {
          assignedAuditors: {
            some: { id: userId },
          },
          status: 'In Progress',
        },
        select: {
          id: true,
          auditName: true,
          endDate: true,
        },
      });
      tasks.push(
        ...assignedAudits.map(audit => ({
          id: `audit-${audit.id}`,
          title: `Execute Audit: ${audit.auditName}`,
          dueDate: audit.endDate ? audit.endDate.toISOString().split('T')[0] : null,
          type: 'audit',
          link: `/audits/${audit.id}`,
        }))
      );
    }

    if (isManager) {
      const evidenceToReview = await this.prisma.evidence.findMany({
        where: {
          status: 'Uploaded',
          auditProgram: {
            audit: { assignedManagerId: userId },
          },
        },
        select: {
          uploadedAt: true,
          auditProgram: {
            select: { audit: { select: { id: true, auditName: true } } },
          },
        },
        orderBy: { uploadedAt: 'desc' },
      });
      const reviewGroups = new Map<number, { auditName: string; count: number; latest: Date | null }>();
      for (const ev of evidenceToReview) {
        const auditId = ev.auditProgram.audit.id;
        const auditName = ev.auditProgram.audit.auditName;
        const latest = ev.uploadedAt ? new Date(ev.uploadedAt) : null;
        const existing = reviewGroups.get(auditId);
        if (existing) {
          existing.count += 1;
          if (latest && (!existing.latest || latest > existing.latest)) existing.latest = latest;
        } else {
          reviewGroups.set(auditId, { auditName, count: 1, latest });
        }
      }
      for (const [auditId, g] of reviewGroups.entries()) {
        tasks.push({
          id: `evidence-review-${auditId}`,
          title: `Review Evidence: ${g.count} item(s) in '${g.auditName}'`,
          dueDate: g.latest ? g.latest.toISOString().split('T')[0] : null,
          type: 'evidence_review',
          link: `/evidence?audit=${auditId}`,
        });
      }
    }

    if (isCAE) {
      const evidenceToApprove = await this.prisma.evidence.findMany({
        where: {
          status: 'Reviewed',
        },
        select: {
          uploadedAt: true,
          auditProgram: {
            select: { audit: { select: { id: true, auditName: true } } },
          },
        },
        orderBy: { uploadedAt: 'desc' },
      });
      const approveGroups = new Map<number, { auditName: string; count: number; latest: Date | null }>();
      for (const ev of evidenceToApprove) {
        const auditId = ev.auditProgram.audit.id;
        const auditName = ev.auditProgram.audit.auditName;
        const latest = ev.uploadedAt ? new Date(ev.uploadedAt) : null;
        const existing = approveGroups.get(auditId);
        if (existing) {
          existing.count += 1;
          if (latest && (!existing.latest || latest > existing.latest)) existing.latest = latest;
        } else {
          approveGroups.set(auditId, { auditName, count: 1, latest });
        }
      }
      for (const [auditId, g] of approveGroups.entries()) {
        tasks.push({
          id: `evidence-approval-${auditId}`,
          title: `Approve Evidence: ${g.count} item(s) in '${g.auditName}'`,
          dueDate: g.latest ? g.latest.toISOString().split('T')[0] : null,
          type: 'evidence_approval',
          link: `/evidence?audit=${auditId}`,
        });
      }
    }

    return tasks;
  }
}
