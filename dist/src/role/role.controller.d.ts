import { RoleService, CreateRoleDto, UpdateRoleDto } from './role.service';
export declare class RoleController {
    private roleService;
    constructor(roleService: RoleService);
    getAll(): Promise<{
        roleName: string;
        description: string | null;
        id: number;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    getOne(id: number): Promise<{
        roleName: string;
        description: string | null;
        id: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    create(data: CreateRoleDto): Promise<{
        roleName: string;
        description: string | null;
        id: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: number, data: UpdateRoleDto): Promise<{
        roleName: string;
        description: string | null;
        id: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    delete(id: number): Promise<{
        roleName: string;
        description: string | null;
        id: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
