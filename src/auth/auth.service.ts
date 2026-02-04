import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

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

    const payload = { 
      username: user.email, 
      sub: user.id, 
      roles: user.userRoles?.map(ur => ur.role.roleName) || [] 
    };
    
     
    const { passwordHash, ...result } = user;
    
    return {
      ...result,
      token: this.jwtService.sign(payload),
    };
  }
}
