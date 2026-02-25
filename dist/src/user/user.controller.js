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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const common_1 = require("@nestjs/common");
const user_service_1 = require("./user.service");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
const uuid_1 = require("uuid");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const profileStorage = (0, multer_1.diskStorage)({
    destination: './uploads/profile-pictures',
    filename: (req, file, cb) => {
        const name = file.originalname.split('.')[0];
        const fileExt = (0, path_1.extname)(file.originalname);
        const randomName = `${(0, uuid_1.v4)()}-${name.replace(/\s/g, '_')}${fileExt}`;
        cb(null, randomName);
    },
});
let UserController = class UserController {
    userService;
    constructor(userService) {
        this.userService = userService;
    }
    getProfile(req) {
        return this.userService.findOne(req.user.id);
    }
    async updateProfile(file, data, req) {
        const profilePictureUrl = file ? `/uploads/profile-pictures/${file.filename}` : undefined;
        const updateData = { ...data };
        if (profilePictureUrl)
            updateData.profilePicture = profilePictureUrl;
        return this.userService.update(req.user.id, updateData);
    }
    getTasks(req) {
        return this.userService.getTasks(req.user.id);
    }
    getAll() {
        return this.userService.findAll();
    }
    getOne(id) {
        return this.userService.findOne(id);
    }
    create(data) {
        return this.userService.create(data);
    }
    update(id, data) {
        return this.userService.update(id, data);
    }
    delete(id) {
        return this.userService.delete(id);
    }
    assignRole(userId, roleId) {
        return this.userService.assignRole(userId, roleId);
    }
    removeRole(userId, roleId) {
        return this.userService.removeRole(userId, roleId);
    }
    createProcessOwner(data) {
        return this.userService.createProcessOwner(data);
    }
    getUserRoles(userId) {
        return this.userService.getUserRoles(userId);
    }
};
exports.UserController = UserController;
__decorate([
    (0, common_1.Get)('me'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Post)('me'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('profilePicture', {
        storage: profileStorage,
        fileFilter: (req, file, cb) => {
            const allowed = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
            if (!allowed.includes(file.mimetype)) {
                return cb(new common_1.BadRequestException('Invalid file type. Only images are allowed.'), false);
            }
            cb(null, true);
        },
        limits: { fileSize: 5 * 1024 * 1024 },
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, user_service_1.UpdateUserDto, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "updateProfile", null);
__decorate([
    (0, common_1.Get)('me/tasks'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "getTasks", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], UserController.prototype, "getAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "getOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_service_1.CreateUserDto]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, user_service_1.UpdateUserDto]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "delete", null);
__decorate([
    (0, common_1.Post)(':userId/roles/:roleId'),
    __param(0, (0, common_1.Param)('userId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('roleId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "assignRole", null);
__decorate([
    (0, common_1.Delete)(':userId/roles/:roleId'),
    __param(0, (0, common_1.Param)('userId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('roleId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "removeRole", null);
__decorate([
    (0, common_1.Post)('process-owner'),
    (0, roles_decorator_1.Roles)('System Administrator'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_service_1.CreateProcessOwnerDto]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "createProcessOwner", null);
__decorate([
    (0, common_1.Get)(':userId/roles'),
    __param(0, (0, common_1.Param)('userId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "getUserRoles", null);
exports.UserController = UserController = __decorate([
    (0, common_1.Controller)('users'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [user_service_1.UserService])
], UserController);
//# sourceMappingURL=user.controller.js.map