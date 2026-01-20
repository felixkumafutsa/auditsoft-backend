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
exports.AuditService = exports.UpdateAuditDto = exports.CreateAuditDto = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
class CreateAuditDto {
    auditName;
    auditType;
    status;
    startDate;
    endDate;
    assignedManagerId;
    auditUniverseId;
}
exports.CreateAuditDto = CreateAuditDto;
class UpdateAuditDto {
    auditName;
    auditType;
    status;
    startDate;
    endDate;
    assignedManagerId;
}
exports.UpdateAuditDto = UpdateAuditDto;
let AuditService = class AuditService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        return this.prisma.audit.findMany({
            include: { findings: true, auditPrograms: true },
            orderBy: { createdAt: 'desc' }
        });
    }
    async findOne(id) {
        const audit = await this.prisma.audit.findUnique({
            where: { id },
            include: { findings: true, auditPrograms: true },
        });
        if (!audit) {
            throw new common_1.NotFoundException(`Audit with ID ${id} not found`);
        }
        return audit;
    }
    async create(data) {
        if (!data.auditName || !data.auditType) {
            throw new common_1.BadRequestException('auditName and auditType are required');
        }
        return this.prisma.audit.create({
            data: {
                auditName: data.auditName,
                auditType: data.auditType,
                status: data.status || 'planned',
                startDate: data.startDate,
                endDate: data.endDate,
                assignedManagerId: data.assignedManagerId,
                auditUniverseId: data.auditUniverseId,
            },
            include: { findings: true, auditPrograms: true },
        });
    }
    async update(id, data) {
        const audit = await this.findOne(id);
        return this.prisma.audit.update({
            where: { id },
            data: {
                ...(data.auditName && { auditName: data.auditName }),
                ...(data.auditType && { auditType: data.auditType }),
                ...(data.status && { status: data.status }),
                ...(data.startDate && { startDate: data.startDate }),
                ...(data.endDate && { endDate: data.endDate }),
                ...(data.assignedManagerId !== undefined && { assignedManagerId: data.assignedManagerId }),
            },
            include: { findings: true, auditPrograms: true },
        });
    }
    async delete(id) {
        const audit = await this.findOne(id);
        return this.prisma.audit.delete({
            where: { id },
            include: { findings: true, auditPrograms: true },
        });
    }
};
exports.AuditService = AuditService;
exports.AuditService = AuditService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AuditService);
//# sourceMappingURL=audit.service.js.map