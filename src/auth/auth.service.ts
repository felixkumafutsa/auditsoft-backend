import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(private userService: UserService) {}

  async login(email: string, pass: string): Promise<any> {
    if (!email || !pass) {
        throw new BadRequestException('Email and password are required');
    }

    const user = await this.userService.findByEmail(email);
    if (!user) {
        throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await this.userService.validatePassword(pass, user.passwordHash);
    if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...result } = user;
    return result;
  }
}
