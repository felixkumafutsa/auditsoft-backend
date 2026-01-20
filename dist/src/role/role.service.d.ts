import { PrismaService } from '../../prisma/prisma.service';
import { Role } from '@prisma/client';
export declare class CreateRoleDto {
    roleName: string;
    description?: string;
}
export declare class UpdateRoleDto {
    roleName?: string;
    description?: string;
}
export declare class RoleService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<Role[]>;
    findOne(id: number): Promise<Role>;
    findByName(roleName: string): Promise<Role | null>;
    create(data: CreateRoleDto): Promise<Role>;
    update(id: number, data: UpdateRoleDto): Promise<Role>;
    delete(id: number): Promise<Role>;
}
