import { RoleService, CreateRoleDto, UpdateRoleDto } from './role.service';
export declare class RoleController {
    private roleService;
    constructor(roleService: RoleService);
    getAll(): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        roleName: string;
        description: string | null;
    }[]>;
    getOne(id: number): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        roleName: string;
        description: string | null;
    }>;
    create(data: CreateRoleDto): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        roleName: string;
        description: string | null;
    }>;
    update(id: number, data: UpdateRoleDto): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        roleName: string;
        description: string | null;
    }>;
    delete(id: number): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        roleName: string;
        description: string | null;
    }>;
}
