"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const user_service_1 = require("../user/user.service");
const config_1 = require("@nestjs/config");
let AuthService = class AuthService {
    userService;
    jwtService;
    configService;
    constructor(userService, jwtService, configService) {
        this.userService = userService;
        this.jwtService = jwtService;
        this.configService = configService;
    }
    async login(email, pass) {
        if (!email || !pass) {
            throw new common_1.BadRequestException('Email and password are required');
        }
        const user = await this.userService.findByEmail(email);
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const isPasswordValid = await this.userService.validatePassword(pass, user.passwordHash);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Invalid credentials');
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
            expiresIn: this.configService.get('JWT_EXPIRY') || '8h',
        };
    }
    async refreshToken(existingToken) {
        let payload;
        try {
            payload = this.jwtService.verify(existingToken, {
                secret: this.configService.get('JWT_SECRET'),
            });
        }
        catch {
            throw new common_1.UnauthorizedException('Invalid or expired token');
        }
        const user = await this.userService.findByEmail(payload.username);
        if (!user) {
            throw new common_1.UnauthorizedException('User no longer exists');
        }
        const newPayload = {
            username: user.email,
            sub: user.id,
            roles: (user.userRoles || []).map((ur) => ur.role.roleName),
        };
        const expiresIn = this.configService.get('JWT_EXPIRY') || '8h';
        return {
            token: this.jwtService.sign(newPayload),
            expiresIn,
        };
    }
    async logout(user) {
        return { message: 'Logout successful' };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [user_service_1.UserService,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map