import { Controller, Get, Post, Body, Param, ParseIntPipe, Query } from '@nestjs/common';
import { TimesheetService } from './timesheet.service';

@Controller('timesheets')
export class TimesheetController {
    constructor(private readonly timesheetService: TimesheetService) { }

    @Post()
    logTime(
        @Body('userId') userId: number,
        @Body('auditId') auditId: number,
        @Body('hours') hours: number,
        @Body('date') date: string,
        @Body('activity') activity: string
    ) {
        return this.timesheetService.logTime(userId, auditId, hours, new Date(date), activity);
    }

    @Get('my/:userId')
    getMyTimesheets(@Param('userId', ParseIntPipe) userId: number) {
        return this.timesheetService.getMyTimesheets(userId);
    }

    @Get('audit/:auditId')
    getAuditTimesheets(@Param('auditId', ParseIntPipe) auditId: number) {
        return this.timesheetService.getAuditTimesheets(auditId);
    }

    @Get('utilization')
    getUtilization() {
        return this.timesheetService.getResourceUtilization();
    }
}
