"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = exports.CreateProcessOwnerDto = exports.UpdateUserDto = exports.CreateUserDto = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const crypto_1 = require("crypto");
const util_1 = require("util");
const class_validator_1 = require("class-validator");
const scryptAsync = (0, util_1.promisify)(crypto_1.scrypt);
class CreateUserDto {
    name;
    email;
    password;
    status;
    mfaEnabled;
    auditUniverseEntityIds;
}
exports.CreateUserDto = CreateUserDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateUserDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], CreateUserDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateUserDto.prototype, "password", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateUserDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateUserDto.prototype, "mfaEnabled", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsNumber)({}, { each: true }),
    __metadata("design:type", Array)
], CreateUserDto.prototype, "auditUniverseEntityIds", void 0);
class UpdateUserDto {
    name;
    email;
    password;
    status;
    mfaEnabled;
    auditUniverseEntityIds;
    profilePicture;
}
exports.UpdateUserDto = UpdateUserDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "password", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateUserDto.prototype, "mfaEnabled", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsNumber)({}, { each: true }),
    __metadata("design:type", Array)
], UpdateUserDto.prototype, "auditUniverseEntityIds", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "profilePicture", void 0);
class CreateProcessOwnerDto {
    name;
    email;
    password;
    auditUniverseId;
}
exports.CreateProcessOwnerDto = CreateProcessOwnerDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateProcessOwnerDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], CreateProcessOwnerDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateProcessOwnerDto.prototype, "password", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateProcessOwnerDto.prototype, "auditUniverseId", void 0);
let UserService = class UserService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async hashPassword(password) {
        const salt = (0, crypto_1.randomBytes)(16).toString('hex');
        const hash = (await scryptAsync(password, salt, 64));
        return `${salt}:${hash.toString('hex')}`;
    }
    async validatePassword(password, hash) {
        const [salt, storedHash] = hash.split(':');
        const newHash = (await scryptAsync(password, salt, 64));
        return newHash.toString('hex') === storedHash;
    }
    async findAll() {
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
    async findOne(id) {
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
            throw new common_1.NotFoundException(`User with ID ${id} not found`);
        }
        return user;
    }
    async findByEmail(email) {
        return this.prisma.user.findUnique({
            where: { email },
            include: { userRoles: { include: { role: true } } },
        });
    }
    async create(data) {
        if (!data.name || !data.email || !data.password) {
            throw new common_1.BadRequestException('Name, email, and password are required');
        }
        const existingUser = await this.findByEmail(data.email);
        if (existingUser) {
            throw new common_1.BadRequestException('Email already in use');
        }
        const passwordHash = await this.hashPassword(data.password);
        return this.prisma.user.create({
            data: {
                name: data.name,
                email: data.email,
                passwordHash: passwordHash,
                profilePicture: data.profilePicture || undefined,
                status: data.status || 'active',
                mfaEnabled: data.mfaEnabled || false,
                auditUniverseOwner: data.auditUniverseEntityIds ? {
                    connect: data.auditUniverseEntityIds.map(id => ({ id }))
                } : undefined,
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
    async update(id, data) {
        await this.findOne(id);
        if (data.email) {
            const existingUser = await this.findByEmail(data.email);
            if (existingUser && existingUser.id !== id) {
                throw new common_1.BadRequestException('Email already in use');
            }
        }
        let passwordHash = undefined;
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
                profilePicture: data.profilePicture || undefined,
                auditUniverseOwner: data.auditUniverseEntityIds ? {
                    set: data.auditUniverseEntityIds.map(id => ({ id }))
                } : undefined,
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
    async delete(id) {
        await this.findOne(id);
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
    async assignRole(userId, roleId) {
        await this.findOne(userId);
        const role = await this.prisma.role.findUnique({
            where: { id: roleId },
        });
        if (!role) {
            throw new common_1.NotFoundException(`Role with ID ${roleId} not found`);
        }
        const existingAssignment = await this.prisma.userRole.findUnique({
            where: { userId_roleId: { userId, roleId } },
        });
        if (existingAssignment) {
            throw new common_1.BadRequestException('User already has this role');
        }
        return this.prisma.userRole.create({
            data: {
                userId,
                roleId,
            },
            include: { user: { select: { id: true, name: true, email: true } }, role: true },
        });
    }
    async removeRole(userId, roleId) {
        const userRole = await this.prisma.userRole.findUnique({
            where: { userId_roleId: { userId, roleId } },
        });
        if (!userRole) {
            throw new common_1.NotFoundException(`User-Role relationship not found`);
        }
        await this.prisma.userRole.delete({
            where: { userId_roleId: { userId, roleId } },
        });
    }
    async getUserRoles(userId) {
        await this.findOne(userId);
        return this.prisma.userRole.findMany({
            where: { userId },
            include: { role: true },
        });
    }
    async getTasks(userId) {
        const userRoles = await this.prisma.userRole.findMany({
            where: { userId },
            include: { role: true },
        });
        const roleNames = userRoles.map(ur => ur.role?.roleName);
        const roleSet = new Set(roleNames);
        const isManager = roleSet.has('Audit Manager') || roleSet.has('Manager');
        const isCAE = roleSet.has('Chief Auditor');
        const isAuditor = roleSet.has('Auditor');
        const tasks = [];
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
            tasks.push(...assignedAudits.map(audit => ({
                id: `audit-${audit.id}`,
                title: `Execute Audit: ${audit.auditName}`,
                dueDate: audit.endDate ? audit.endDate.toISOString().split('T')[0] : null,
                type: 'audit',
                link: `/audits/${audit.id}`,
            })));
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
            const reviewGroups = new Map();
            for (const ev of evidenceToReview) {
                const auditId = ev.auditProgram.audit.id;
                const auditName = ev.auditProgram.audit.auditName;
                const latest = ev.uploadedAt ? new Date(ev.uploadedAt) : null;
                const existing = reviewGroups.get(auditId);
                if (existing) {
                    existing.count += 1;
                    if (latest && (!existing.latest || latest > existing.latest))
                        existing.latest = latest;
                }
                else {
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
            const approveGroups = new Map();
            for (const ev of evidenceToApprove) {
                const auditId = ev.auditProgram.audit.id;
                const auditName = ev.auditProgram.audit.auditName;
                const latest = ev.uploadedAt ? new Date(ev.uploadedAt) : null;
                const existing = approveGroups.get(auditId);
                if (existing) {
                    existing.count += 1;
                    if (latest && (!existing.latest || latest > existing.latest))
                        existing.latest = latest;
                }
                else {
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
    async createProcessOwner(data) {
        if (!data.name || !data.email || !data.password || !data.auditUniverseId) {
            throw new common_1.BadRequestException('Name, email, password, and auditUniverseId are required');
        }
        const existingUser = await this.findByEmail(data.email);
        if (existingUser) {
            throw new common_1.BadRequestException('Email already in use');
        }
        const auditUniverse = await this.prisma.auditUniverse.findUnique({
            where: { id: data.auditUniverseId },
        });
        if (!auditUniverse) {
            throw new common_1.BadRequestException(`Audit Universe with ID ${data.auditUniverseId} not found`);
        }
        const processOwnerRole = await this.prisma.role.findUnique({
            where: { roleName: 'Process Owner' },
        });
        if (!processOwnerRole) {
            throw new common_1.BadRequestException('Process Owner role not found');
        }
        const passwordHash = await this.hashPassword(data.password);
        return this.prisma.user.create({
            data: {
                name: data.name,
                email: data.email,
                passwordHash: passwordHash,
                status: 'active',
                mfaEnabled: false,
                userRoles: {
                    create: [{
                            roleId: processOwnerRole.id,
                        }],
                },
                auditUniverseOwner: {
                    connect: { id: data.auditUniverseId },
                },
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
                auditUniverseOwner: true,
            },
        });
    }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UserService);
//# sourceMappingURL=user.service.js.map