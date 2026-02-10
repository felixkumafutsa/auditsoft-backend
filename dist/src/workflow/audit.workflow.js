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
exports.AuditWorkflowService = exports.AuditStatus = void 0;
const common_1 = require("@nestjs/common");
const notification_service_1 = require("../notification/notification.service");
var AuditStatus;
(function (AuditStatus) {
    AuditStatus["PLANNED"] = "Planned";
    AuditStatus["APPROVED"] = "Approved";
    AuditStatus["REJECTED"] = "Rejected";
    AuditStatus["IN_PROGRESS"] = "In Progress";
    AuditStatus["UNDER_REVIEW"] = "Under Review";
    AuditStatus["EXECUTION_FINISHED"] = "Execution Finished";
    AuditStatus["FINALIZED"] = "Finalized";
    AuditStatus["PROCESS_OWNER_REVIEW"] = "Process Owner Review";
    AuditStatus["CLOSED"] = "Closed";
})(AuditStatus || (exports.AuditStatus = AuditStatus = {}));
let AuditWorkflowService = class AuditWorkflowService {
    notificationService;
    constructor(notificationService) {
        this.notificationService = notificationService;
    }
    validTransitions = {
        [AuditStatus.PLANNED]: [AuditStatus.APPROVED, AuditStatus.REJECTED, AuditStatus.CLOSED],
        [AuditStatus.APPROVED]: [AuditStatus.IN_PROGRESS, AuditStatus.CLOSED],
        [AuditStatus.REJECTED]: [AuditStatus.PLANNED, AuditStatus.CLOSED],
        [AuditStatus.IN_PROGRESS]: [AuditStatus.UNDER_REVIEW, AuditStatus.CLOSED],
        [AuditStatus.UNDER_REVIEW]: [AuditStatus.EXECUTION_FINISHED, AuditStatus.IN_PROGRESS],
        [AuditStatus.EXECUTION_FINISHED]: [AuditStatus.FINALIZED, AuditStatus.UNDER_REVIEW],
        [AuditStatus.FINALIZED]: [AuditStatus.PROCESS_OWNER_REVIEW],
        [AuditStatus.PROCESS_OWNER_REVIEW]: [AuditStatus.CLOSED],
        [AuditStatus.CLOSED]: [],
    };
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
    async handleTransition(auditId, auditName, fromStatus, toStatus, managerId) {
        if (!this.canTransition(fromStatus, toStatus)) {
            throw new common_1.BadRequestException(`Invalid transition from ${fromStatus} to ${toStatus}`);
        }
        await this.triggerNotification(auditId, auditName, toStatus, managerId);
    }
    async triggerNotification(auditId, auditName, status, managerId) {
        let title = '';
        let message = '';
        let type = 'info';
        const targetUserId = managerId;
        switch (status) {
            case AuditStatus.APPROVED:
                title = 'Audit Approved';
                message = `The audit "${auditName}" has been approved and is ready to start.`;
                type = 'success';
                break;
            case AuditStatus.REJECTED:
                title = 'Audit Rejected';
                message = `The audit plan for "${auditName}" has been rejected by the CAE.`;
                type = 'warning';
                break;
            case AuditStatus.IN_PROGRESS:
                title = 'Audit Started';
                message = `The audit "${auditName}" is now in progress.`;
                type = 'info';
                break;
            case AuditStatus.UNDER_REVIEW:
                title = 'Audit Review Needed';
                message = `The audit "${auditName}" is ready for manager review.`;
                type = 'action_required';
                break;
            case AuditStatus.EXECUTION_FINISHED:
                title = 'Audit Execution Finished';
                message = `The execution for "${auditName}" has been confirmed as finished and is ready for CAE review.`;
                type = 'info';
                break;
            case AuditStatus.FINALIZED:
                title = 'Audit Finalized';
                message = `The audit "${auditName}" has been finalized by the CAE.`;
                type = 'success';
                break;
            case AuditStatus.PROCESS_OWNER_REVIEW:
                title = 'Audit Ready for Process Owner Review';
                message = `The audit "${auditName}" is ready for your review.`;
                type = 'action_required';
                break;
            case AuditStatus.CLOSED:
                title = 'Audit Closed';
                message = `The audit "${auditName}" has been officially closed.`;
                type = 'warning';
                break;
        }
        if (title && targetUserId) {
            const notification = {
                userId: targetUserId,
                title,
                message,
                type,
                link: `/audits/${auditId}`,
            };
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
                [AuditStatus.APPROVED]: ['Chief Audit Executive (CAE)', 'CAE'],
                [AuditStatus.REJECTED]: ['Chief Audit Executive (CAE)', 'CAE'],
                [AuditStatus.CLOSED]: ['Chief Audit Executive (CAE)', 'CAE'],
            },
            [AuditStatus.APPROVED]: {
                [AuditStatus.IN_PROGRESS]: ['Auditor'],
                [AuditStatus.CLOSED]: ['Chief Audit Executive (CAE)', 'CAE'],
            },
            [AuditStatus.REJECTED]: {
                [AuditStatus.PLANNED]: ['Audit Manager', 'Manager'],
                [AuditStatus.CLOSED]: ['Chief Audit Executive (CAE)', 'CAE'],
            },
            [AuditStatus.IN_PROGRESS]: {
                [AuditStatus.UNDER_REVIEW]: ['Auditor'],
                [AuditStatus.CLOSED]: ['Chief Audit Executive (CAE)', 'CAE'],
            },
            [AuditStatus.UNDER_REVIEW]: {
                [AuditStatus.EXECUTION_FINISHED]: ['Audit Manager', 'Manager'],
                [AuditStatus.IN_PROGRESS]: ['Audit Manager', 'Manager'],
            },
            [AuditStatus.EXECUTION_FINISHED]: {
                [AuditStatus.FINALIZED]: ['Chief Audit Executive (CAE)', 'CAE'],
                [AuditStatus.UNDER_REVIEW]: ['Chief Audit Executive (CAE)', 'CAE'],
            },
            [AuditStatus.FINALIZED]: {
                [AuditStatus.PROCESS_OWNER_REVIEW]: ['Process Owner', 'ProcessOwner'],
            },
            [AuditStatus.PROCESS_OWNER_REVIEW]: {
                [AuditStatus.CLOSED]: ['Chief Audit Executive (CAE)', 'CAE'],
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