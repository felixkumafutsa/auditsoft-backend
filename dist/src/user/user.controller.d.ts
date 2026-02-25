import { UserService, CreateUserDto, UpdateUserDto, CreateProcessOwnerDto } from './user.service';
export declare class UserController {
    private userService;
    constructor(userService: UserService);
    getProfile(req: any): Promise<Omit<{
        name: string;
        email: string;
        status: string;
        mfaEnabled: boolean;
        profilePicture: string | null;
        id: number;
        passwordHash: string;
        createdAt: Date;
        updatedAt: Date;
    }, "passwordHash">>;
    updateProfile(file: Express.Multer.File, data: UpdateUserDto, req: any): Promise<Omit<{
        name: string;
        email: string;
        status: string;
        mfaEnabled: boolean;
        profilePicture: string | null;
        id: number;
        passwordHash: string;
        createdAt: Date;
        updatedAt: Date;
    }, "passwordHash">>;
    getTasks(req: any): Promise<any[]>;
    getAll(): Promise<any[]>;
    getOne(id: number): Promise<Omit<{
        name: string;
        email: string;
        status: string;
        mfaEnabled: boolean;
        profilePicture: string | null;
        id: number;
        passwordHash: string;
        createdAt: Date;
        updatedAt: Date;
    }, "passwordHash">>;
    create(data: CreateUserDto): Promise<Omit<{
        name: string;
        email: string;
        status: string;
        mfaEnabled: boolean;
        profilePicture: string | null;
        id: number;
        passwordHash: string;
        createdAt: Date;
        updatedAt: Date;
    }, "passwordHash">>;
    update(id: number, data: UpdateUserDto): Promise<Omit<{
        name: string;
        email: string;
        status: string;
        mfaEnabled: boolean;
        profilePicture: string | null;
        id: number;
        passwordHash: string;
        createdAt: Date;
        updatedAt: Date;
    }, "passwordHash">>;
    delete(id: number): Promise<Omit<{
        name: string;
        email: string;
        status: string;
        mfaEnabled: boolean;
        profilePicture: string | null;
        id: number;
        passwordHash: string;
        createdAt: Date;
        updatedAt: Date;
    }, "passwordHash">>;
    assignRole(userId: number, roleId: number): Promise<any>;
    removeRole(userId: number, roleId: number): Promise<void>;
    createProcessOwner(data: CreateProcessOwnerDto): Promise<Omit<{
        name: string;
        email: string;
        status: string;
        mfaEnabled: boolean;
        profilePicture: string | null;
        id: number;
        passwordHash: string;
        createdAt: Date;
        updatedAt: Date;
    }, "passwordHash">>;
    getUserRoles(userId: number): Promise<any[]>;
}
