import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, Query } from '@nestjs/common';
import { AuditTimelineService } from './audit-timeline.service';
import { AuditRiskService, RiskAssessmentDto } from './audit-risk.service';
import { AuditApprovalService, ApprovalRequestDto, SubmitApprovalDto } from './audit-approval.service';
import { AuditCommentsService, AddCommentDto } from './audit-comments.service';
import { BulkAuditService, BulkAuditUpdateDto, AuditFilterDto } from './bulk-audit.service';

@Controller('audits')
export class AuditWorkflowController {
  constructor(
    private timelineService: AuditTimelineService,
    private riskService: AuditRiskService,
    private approvalService: AuditApprovalService,
    private commentsService: AuditCommentsService,
    private bulkService: BulkAuditService,
  ) {}

  // ========== TIMELINE & HISTORY ==========

  @Get(':id/timeline')
  getAuditTimeline(@Param('id', ParseIntPipe) auditId: number) {
    return this.timelineService.getAuditTimeline(auditId);
  }

  @Get(':id/activity-summary')
  getActivitySummary(@Param('id', ParseIntPipe) auditId: number) {
    return this.timelineService.getActivitySummary(auditId);
  }

  // ========== RISK ASSESSMENT ==========

  @Post(':id/risk-assessment')
  recordRiskAssessment(
    @Param('id', ParseIntPipe) auditId: number,
    @Body() body: Omit<RiskAssessmentDto, 'auditId'>
  ) {
    return this.riskService.recordRiskAssessment({
      ...body,
      auditId,
    });
  }

  @Get(':id/risk-assessments')
  getRiskAssessments(@Param('id', ParseIntPipe) auditId: number) {
    return this.riskService.getRiskAssessments(auditId);
  }

  @Get(':id/overall-risk')
  getOverallRisk(@Param('id', ParseIntPipe) auditId: number) {
    return this.riskService.calculateOverallRisk(auditId);
  }

  @Get(':id/risk-trend')
  getRiskTrend(@Param('id', ParseIntPipe) auditId: number) {
    return this.riskService.getRiskTrend(auditId);
  }

  // ========== APPROVALS ==========

  @Post(':id/request-approval')
  requestApproval(
    @Param('id', ParseIntPipe) auditId: number,
    @Body() body: Omit<ApprovalRequestDto, 'auditId'>
  ) {
    return this.approvalService.requestApproval({
      ...body,
      auditId,
    });
  }

  @Post(':id/submit-approval')
  submitApproval(
    @Param('id', ParseIntPipe) auditId: number,
    @Body() body: SubmitApprovalDto
  ) {
    return this.approvalService.submitApproval(auditId, body);
  }

  @Get(':id/approval-history')
  getApprovalHistory(@Param('id', ParseIntPipe) auditId: number) {
    return this.approvalService.getApprovalHistory(auditId);
  }

  @Get('user/:userId/pending-approvals')
  getPendingApprovalsForUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.approvalService.getPendingApprovalsForUser(userId);
  }

  // ========== COMMENTS ==========

  @Post(':id/comments')
  addComment(
    @Param('id', ParseIntPipe) auditId: number,
    @Body() body: Omit<AddCommentDto, 'auditId'>
  ) {
    return this.commentsService.addComment({
      ...body,
      auditId,
    });
  }

  @Get(':id/comments')
  getAuditComments(@Param('id', ParseIntPipe) auditId: number) {
    return this.commentsService.getAuditComments(auditId);
  }

  @Get(':id/comments/:type')
  getCommentsByType(
    @Param('id', ParseIntPipe) auditId: number,
    @Param('type') commentType: string
  ) {
    return this.commentsService.getCommentsByType(auditId, commentType);
  }

  @Get(':id/comment-stats')
  getCommentStats(@Param('id', ParseIntPipe) auditId: number) {
    return this.commentsService.getCommentStats(auditId);
  }

  @Delete('comments/:commentId')
  deleteComment(@Param('commentId', ParseIntPipe) commentId: number) {
    return this.commentsService.deleteComment(commentId);
  }

  // ========== BULK OPERATIONS ==========

  @Put('bulk-update')
  bulkUpdateAudits(@Body() body: BulkAuditUpdateDto) {
    return this.bulkService.bulkUpdateAudits(body);
  }

  @Get('search/by-filters')
  findAuditsByFilters(@Query() filters: AuditFilterDto) {
    return this.bulkService.findAuditsByFilters(filters);
  }

  @Get('analytics/statistics')
  getAuditStatistics() {
    return this.bulkService.getAuditStatistics();
  }

  @Get('analytics/due-soon')
  getAuditsDueSoon(@Query('days') days?: string) {
    const daysFromNow = days ? parseInt(days, 10) : 7;
    return this.bulkService.getAuditsDueSoon(daysFromNow);
  }

  @Get('analytics/overdue')
  getOverdueAudits() {
    return this.bulkService.getOverdueAudits();
  }

  @Post('archive/old-audits')
  archiveOldAudits(@Query('days') days?: string) {
    const olderThanDays = days ? parseInt(days, 10) : 365;
    return this.bulkService.archiveOldAudits(olderThanDays);
  }
}
