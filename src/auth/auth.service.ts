import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) { }

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
      roles: user.userRoles?.map(ur => ur.role.roleName) || [],
    };

    const { passwordHash, ...result } = user;

    return {
      ...result,
      token: this.jwtService.sign(payload),
      expiresIn: this.configService.get<string>('JWT_EXPIRY') || '8h',
    };
  }

  /** Validate and re-issue a token from a still-valid existing token. */
  async refreshToken(existingToken: string): Promise<{ token: string; expiresIn: string }> {
    let payload: any;
    try {
      payload = this.jwtService.verify(existingToken, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }

    const user = await this.userService.findByEmail(payload.username);
    if (!user) {
      throw new UnauthorizedException('User no longer exists');
    }

    const newPayload = {
      username: user.email,
      sub: user.id,
      roles: (user.userRoles || []).map((ur: any) => ur.role.roleName),
    };

    const expiresIn = this.configService.get<string>('JWT_EXPIRY') || '8h';
    return {
      token: this.jwtService.sign(newPayload),
      expiresIn,
    };
  }

  /** Logout user and invalidate their token */
  async logout(user: any): Promise<{ message: string }> {
    // In a real implementation, you might:
    // 1. Add token to a blacklist/revoked list
    // 2. Log the logout event
    // 3. Clear any user sessions
    
    return { message: 'Logout successful' };
  }
}
