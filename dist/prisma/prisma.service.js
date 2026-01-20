"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
let PrismaService = class PrismaService {
    prisma = null;
    getPrisma() {
        if (!this.prisma) {
            this.prisma = new client_1.PrismaClient({
                errorFormat: 'pretty'
            });
        }
        return this.prisma;
    }
    async onModuleInit() {
        try {
            await this.getPrisma().$connect();
        }
        catch (error) {
            console.error('Failed to connect to Prisma:', error);
        }
    }
    async onModuleDestroy() {
        if (this.prisma) {
            try {
                await this.prisma.$disconnect();
            }
            catch (error) {
                console.error('Failed to disconnect from Prisma:', error);
            }
        }
    }
    get user() {
        return this.getPrisma().user;
    }
    get role() {
        return this.getPrisma().role;
    }
    get userRole() {
        return this.getPrisma().userRole;
    }
    get auditUniverse() {
        return this.getPrisma().auditUniverse;
    }
    get audit() {
        return this.getPrisma().audit;
    }
    get auditProgram() {
        return this.getPrisma().auditProgram;
    }
    get evidence() {
        return this.getPrisma().evidence;
    }
    get finding() {
        return this.getPrisma().finding;
    }
    get actionPlan() {
        return this.getPrisma().actionPlan;
    }
    get auditLog() {
        return this.getPrisma().auditLog;
    }
    get complianceFramework() {
        return this.getPrisma().complianceFramework;
    }
    get controlMapping() {
        return this.getPrisma().controlMapping;
    }
    get integration() {
        return this.getPrisma().integration;
    }
    get $connect() {
        return this.getPrisma().$connect.bind(this.getPrisma());
    }
    get $disconnect() {
        return this.getPrisma().$disconnect.bind(this.getPrisma());
    }
};
exports.PrismaService = PrismaService;
exports.PrismaService = PrismaService = __decorate([
    (0, common_1.Injectable)()
], PrismaService);
//# sourceMappingURL=prisma.service.js.map