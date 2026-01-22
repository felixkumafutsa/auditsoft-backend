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
exports.AuditLogController = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let AuditLogController = class AuditLogController {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async search(filters) {
        const limit = filters.limit ? Number(filters.limit) : undefined;
        return this.prisma.auditLog.findMany({
            take: limit,
            orderBy: {
                timestamp: 'desc',
            },
        });
    }
};
exports.AuditLogController = AuditLogController;
__decorate([
    (0, common_1.Post)('search'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuditLogController.prototype, "search", null);
exports.AuditLogController = AuditLogController = __decorate([
    (0, common_1.Controller)('audit-logs'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AuditLogController);
//# sourceMappingURL=audit-log.controller.js.map