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
exports.UserService = exports.UpdateUserDto = exports.CreateUserDto = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const crypto_1 = require("crypto");
const util_1 = require("util");
const scryptAsync = (0, util_1.promisify)(crypto_1.scrypt);
class CreateUserDto {
    name;
    email;
    password;
    status;
    mfaEnabled;
}
exports.CreateUserDto = CreateUserDto;
class UpdateUserDto {
    name;
    email;
    password;
    status;
    mfaEnabled;
}
exports.UpdateUserDto = UpdateUserDto;
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
                status: data.status || 'active',
                mfaEnabled: data.mfaEnabled || false,
            },
            select: {
                id: true,
                name: true,
                email: true,
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
            },
            select: {
                id: true,
                name: true,
                email: true,
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
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UserService);
//# sourceMappingURL=user.service.js.map