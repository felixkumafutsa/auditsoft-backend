import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { ConfigService } from '@nestjs/config';
export declare class AuthService {
    private userService;
    private jwtService;
    private configService;
    constructor(userService: UserService, jwtService: JwtService, configService: ConfigService);
    login(email: string, pass: string): Promise<any>;
    refreshToken(existingToken: string): Promise<{
        token: string;
        expiresIn: string;
    }>;
    logout(user: any): Promise<{
        message: string;
    }>;
}
