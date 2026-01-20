import { AuthService } from './auth.service';
export declare class LoginDto {
    email: string;
    pass: string;
}
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    signIn(signInDto: LoginDto): Promise<any>;
}
