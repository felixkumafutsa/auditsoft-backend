import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TimesheetService {
    constructor(private prisma: PrismaService) { }

    async logTime(userId: number, auditId: number, hours: number, date: Date, activity?: string) {
        return this.prisma.timesheet.create({
            data: {
                userId,
                auditId,
                hours,
                workDate: date,
                activity
            }
        });
    }

    async getMyTimesheets(userId: number) {
        return this.prisma.timesheet.findMany({
            where: { userId },
            include: { audit: true },
            orderBy: { workDate: 'desc' }
        });
    }

    async getAuditTimesheets(auditId: number) {
        return this.prisma.timesheet.findMany({
            where: { auditId },
            include: { user: true },
            orderBy: { workDate: 'desc' }
        });
    }

    async getResourceUtilization() {
        // Aggregate hours by user per month? 
        // For now just return raw data for frontend to process
        return this.prisma.timesheet.findMany({
            include: { user: true, audit: true }
        });
    }
}
