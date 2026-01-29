import { UserService, CreateUserDto, UpdateUserDto } from './user.service';
export declare class UserController {
    private userService;
    constructor(userService: UserService);
    getAll(): Promise<any[]>;
    getOne(id: number): Promise<Omit<{
        name: string;
        id: number;
        email: string;
        passwordHash: string;
        status: string;
        mfaEnabled: boolean;
        createdAt: Date;
        updatedAt: Date;
    }, "passwordHash">>;
    create(data: CreateUserDto): Promise<Omit<{
        name: string;
        id: number;
        email: string;
        passwordHash: string;
        status: string;
        mfaEnabled: boolean;
        createdAt: Date;
        updatedAt: Date;
    }, "passwordHash">>;
    update(id: number, data: UpdateUserDto): Promise<Omit<{
        name: string;
        id: number;
        email: string;
        passwordHash: string;
        status: string;
        mfaEnabled: boolean;
        createdAt: Date;
        updatedAt: Date;
    }, "passwordHash">>;
    delete(id: number): Promise<Omit<{
        name: string;
        id: number;
        email: string;
        passwordHash: string;
        status: string;
        mfaEnabled: boolean;
        createdAt: Date;
        updatedAt: Date;
    }, "passwordHash">>;
    assignRole(userId: number, roleId: number): Promise<any>;
    removeRole(userId: number, roleId: number): Promise<void>;
    getUserRoles(userId: number): Promise<any[]>;
    getTasks(userId: string): Promise<{
        id: string;
        title: string;
        dueDate: string | null;
        type: string;
    }[]>;
}
