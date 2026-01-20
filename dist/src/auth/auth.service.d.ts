import { UserService } from '../user/user.service';
export declare class AuthService {
    private userService;
    constructor(userService: UserService);
    login(email: string, pass: string): Promise<any>;
}
