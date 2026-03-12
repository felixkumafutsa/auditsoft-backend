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
exports.AuditWorkflowService = exports.CAE_COMMENT_REQUIRED_TRANSITIONS = exports.AuditStatus = void 0;
const common_1 = require("@nestjs/common");
const notification_service_1 = require("../notification/notification.service");
var AuditStatus;
(function (AuditStatus) {
    AuditStatus["PLANNED"] = "Planned";
    AuditStatus["APPROVED"] = "Approved";
    AuditStatus["REJECTED"] = "Rejected";
    AuditStatus["IN_PROGRESS"] = "In Progress";
    AuditStatus["UNDER_REVIEW"] = "Under Review";
    AuditStatus["FINALIZED"] = "Finalized";
    AuditStatus["CLOSED"] = "Closed";
    AuditStatus["REPORT_GENERATED"] = "Report Generated";
})(AuditStatus || (exports.AuditStatus = AuditStatus = {}));
exports.CAE_COMMENT_REQUIRED_TRANSITIONS = [
    { from: 'Planned', to: 'Approved' },
    { from: 'Planned', to: 'Rejected' },
];
let AuditWorkflowService = class AuditWorkflowService {
    notificationService;
    constructor(notificationService) {
        this.notificationService = notificationService;
    }
    validTransitions = {
        [AuditStatus.PLANNED]: [AuditStatus.APPROVED, AuditStatus.REJECTED],
        [AuditStatus.REJECTED]: [AuditStatus.PLANNED],
        [AuditStatus.APPROVED]: [AuditStatus.IN_PROGRESS],
        [AuditStatus.IN_PROGRESS]: [AuditStatus.UNDER_REVIEW],
        [AuditStatus.UNDER_REVIEW]: [AuditStatus.FINALIZED, AuditStatus.IN_PROGRESS],
        [AuditStatus.FINALIZED]: [AuditStatus.CLOSED],
        [AuditStatus.CLOSED]: [AuditStatus.REPORT_GENERATED],
        [AuditStatus.REPORT_GENERATED]: [],
    };
    requiresCAEComment(fromStatus, toStatus) {
        return exports.CAE_COMMENT_REQUIRED_TRANSITIONS.some(t => t.from === fromStatus && t.to === toStatus);
    }
    canTransition(fromStatus, toStatus) {
        const from = fromStatus;
        const to = toStatus;
        if (!Object.values(AuditStatus).includes(from)) {
            throw new common_1.BadRequestException(`Invalid current status: ${from}`);
        }
        if (!Object.values(AuditStatus).includes(to)) {
            throw new common_1.BadRequestException(`Invalid target status: ${to}`);
        }
        const allowedTransitions = this.validTransitions[from] || [];
        return allowedTransitions.includes(to);
    }
    async handleTransition(auditId, auditName, fromStatus, toStatus, recipients, caeComment) {
        if (!this.canTransition(fromStatus, toStatus)) {
            throw new common_1.BadRequestException(`Invalid transition from ${fromStatus} to ${toStatus}`);
        }
        if (this.requiresCAEComment(fromStatus, toStatus) && !caeComment) {
            throw new common_1.BadRequestException(`Chief Auditor comment is required for transitioning from ${fromStatus} to ${toStatus}`);
        }
        await this.triggerNotifications(auditId, auditName, fromStatus, toStatus, recipients, caeComment);
    }
    async triggerNotifications(auditId, auditName, fromStatus, toStatus, recipients, caeComment) {
        const link = `/audits/${auditId}`;
        const notifications = [];
        switch (toStatus) {
            case AuditStatus.APPROVED:
                if (recipients.managerId) {
                    notifications.push({
                        userId: recipients.managerId,
                        title: 'Audit Plan Approved',
                        message: `The audit "${auditName}" has been approved by the Chief Auditor.${caeComment ? ` Comment: ${caeComment}` : ''}`,
                        type: 'success',
                        link,
                    });
                }
                if (recipients.auditorIds) {
                    for (const auditorId of recipients.auditorIds) {
                        notifications.push({
                            userId: auditorId,
                            title: 'Audit Ready to Start',
                            message: `The audit "${auditName}" has been approved and is ready for execution.${caeComment ? ` Chief Auditor Comment: ${caeComment}` : ''}`,
                            type: 'info',
                            link,
                        });
                    }
                }
                break;
            case AuditStatus.REJECTED:
                if (recipients.managerId) {
                    notifications.push({
                        userId: recipients.managerId,
                        title: 'Audit Plan Rejected',
                        message: `The audit "${auditName}" has been rejected by the Chief Auditor. Feedback: ${caeComment || 'No comment provided'}`,
                        type: 'warning',
                        link,
                    });
                }
                break;
            case AuditStatus.IN_PROGRESS:
                if (recipients.managerId) {
                    notifications.push({
                        userId: recipients.managerId,
                        title: 'Audit Execution Started',
                        message: `The audit "${auditName}" is now in progress.`,
                        type: 'info',
                        link,
                    });
                }
                break;
            case AuditStatus.UNDER_REVIEW:
                if (recipients.managerId) {
                    notifications.push({
                        userId: recipients.managerId,
                        title: 'Audit Ready for Review',
                        message: `The audit "${auditName}" has been submitted for your review.`,
                        type: 'action_required',
                        link,
                    });
                }
                break;
            case AuditStatus.FINALIZED:
                if (recipients.auditorIds) {
                    for (const auditorId of recipients.auditorIds) {
                        notifications.push({
                            userId: auditorId,
                            title: 'Audit Finalized',
                            message: `The audit "${auditName}" has been finalized by the manager.`,
                            type: 'success',
                            link,
                        });
                    }
                }
                break;
            case AuditStatus.CLOSED:
                if (recipients.managerId) {
                    notifications.push({
                        userId: recipients.managerId,
                        title: 'Audit Closed',
                        message: `The audit "${auditName}" has been closed by the Chief Auditor. Feedback: ${caeComment || 'No comment provided'}`,
                        type: 'success',
                        link,
                    });
                }
                if (recipients.auditorIds) {
                    for (const auditorId of recipients.auditorIds) {
                        notifications.push({
                            userId: auditorId,
                            title: 'Audit Closed',
                            message: `The audit "${auditName}" has been officially closed. Chief Auditor Feedback: ${caeComment || 'No comment provided'}`,
                            type: 'info',
                            link,
                        });
                    }
                }
                break;
            case AuditStatus.REPORT_GENERATED:
                if (recipients.managerId) {
                    notifications.push({
                        userId: recipients.managerId,
                        title: 'Audit Report Generated',
                        message: `The final audit report for "${auditName}" has been generated by the Chief Auditor.`,
                        type: 'success',
                        link,
                    });
                }
                if (recipients.auditorIds) {
                    for (const auditorId of recipients.auditorIds) {
                        notifications.push({
                            userId: auditorId,
                            title: 'Audit Report Generated',
                            message: `The final audit report for "${auditName}" has been generated and is now available.`,
                            type: 'info',
                            link,
                        });
                    }
                }
                break;
        }
        for (const notification of notifications) {
            await this.notificationService.create(notification);
        }
    }
    getAllowedTransitions(currentStatus) {
        const status = currentStatus;
        return this.validTransitions[status] || [];
    }
    getPermittedRoles(fromStatus, toStatus) {
        const transitions = {
            [AuditStatus.PLANNED]: {
                [AuditStatus.APPROVED]: ['Chief Auditor', 'CAE', 'Chief Audit Executive', 'Chief Audit Executive (CAE)'],
                [AuditStatus.REJECTED]: ['Chief Auditor', 'CAE', 'Chief Audit Executive', 'Chief Audit Executive (CAE)'],
            },
            [AuditStatus.REJECTED]: {
                [AuditStatus.PLANNED]: ['Audit Manager', 'Manager'],
            },
            [AuditStatus.APPROVED]: {
                [AuditStatus.IN_PROGRESS]: ['Auditor'],
            },
            [AuditStatus.IN_PROGRESS]: {
                [AuditStatus.UNDER_REVIEW]: ['Auditor'],
            },
            [AuditStatus.UNDER_REVIEW]: {
                [AuditStatus.FINALIZED]: ['Audit Manager', 'Manager'],
                [AuditStatus.IN_PROGRESS]: ['Audit Manager', 'Manager'],
            },
            [AuditStatus.FINALIZED]: {
                [AuditStatus.CLOSED]: ['Chief Auditor', 'CAE', 'Chief Audit Executive', 'Chief Audit Executive (CAE)'],
            },
            [AuditStatus.CLOSED]: {
                [AuditStatus.REPORT_GENERATED]: ['Chief Auditor', 'CAE', 'Chief Audit Executive', 'Chief Audit Executive (CAE)'],
            },
        };
        return transitions[fromStatus]?.[toStatus] || [];
    }
};
exports.AuditWorkflowService = AuditWorkflowService;
exports.AuditWorkflowService = AuditWorkflowService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [notification_service_1.NotificationService])
], AuditWorkflowService);
//# sourceMappingURL=audit.workflow.js.map