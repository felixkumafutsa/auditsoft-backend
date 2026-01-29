import { PrismaService } from '../../prisma/prisma.service';
import { User } from '@prisma/client';
export declare class CreateUserDto {
    name: string;
    email: string;
    password: string;
    status?: string;
    mfaEnabled?: boolean;
}
export declare class UpdateUserDto {
    name?: string;
    email?: string;
    password?: string;
    status?: string;
    mfaEnabled?: boolean;
}
export declare class UserService {
    private prisma;
    constructor(prisma: PrismaService);
    private hashPassword;
    validatePassword(password: string, hash: string): Promise<boolean>;
    findAll(): Promise<any[]>;
    findOne(id: number): Promise<Omit<User, 'passwordHash'>>;
    findByEmail(email: string): Promise<any>;
    create(data: CreateUserDto): Promise<Omit<User, 'passwordHash'>>;
    update(id: number, data: UpdateUserDto): Promise<Omit<User, 'passwordHash'>>;
    delete(id: number): Promise<Omit<User, 'passwordHash'>>;
    assignRole(userId: number, roleId: number): Promise<any>;
    removeRole(userId: number, roleId: number): Promise<void>;
    getUserRoles(userId: number): Promise<any[]>;
    getTasks(userId: number): Promise<{
        id: string;
        title: string;
        dueDate: string | null;
        type: string;
    }[]>;
}
