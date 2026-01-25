"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditWorkflowService = exports.AuditStatus = void 0;
const common_1 = require("@nestjs/common");
var AuditStatus;
(function (AuditStatus) {
    AuditStatus["PLANNED"] = "Planned";
    AuditStatus["APPROVED"] = "Approved";
    AuditStatus["IN_PROGRESS"] = "In Progress";
    AuditStatus["UNDER_REVIEW"] = "Review";
    AuditStatus["FINALIZED"] = "Finalized";
    AuditStatus["CLOSED"] = "Closed";
})(AuditStatus || (exports.AuditStatus = AuditStatus = {}));
let AuditWorkflowService = class AuditWorkflowService {
    validTransitions = {
        [AuditStatus.PLANNED]: [AuditStatus.APPROVED, AuditStatus.CLOSED],
        [AuditStatus.APPROVED]: [AuditStatus.IN_PROGRESS, AuditStatus.CLOSED],
        [AuditStatus.IN_PROGRESS]: [AuditStatus.UNDER_REVIEW, AuditStatus.CLOSED],
        [AuditStatus.UNDER_REVIEW]: [AuditStatus.FINALIZED, AuditStatus.IN_PROGRESS],
        [AuditStatus.FINALIZED]: [AuditStatus.CLOSED],
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
    getAllowedTransitions(currentStatus) {
        const status = currentStatus;
        return this.validTransitions[status] || [];
    }
    getPermittedRoles(fromStatus, toStatus) {
        const transitions = {
            [AuditStatus.PLANNED]: {
                [AuditStatus.APPROVED]: ['CAE'],
                [AuditStatus.CLOSED]: ['Admin'],
            },
            [AuditStatus.APPROVED]: {
                [AuditStatus.IN_PROGRESS]: ['Manager', 'CAE'],
                [AuditStatus.CLOSED]: ['Admin'],
            },
            [AuditStatus.IN_PROGRESS]: {
                [AuditStatus.UNDER_REVIEW]: ['Manager', 'Auditor'],
                [AuditStatus.CLOSED]: ['Admin'],
            },
            [AuditStatus.UNDER_REVIEW]: {
                [AuditStatus.FINALIZED]: ['Manager', 'CAE'],
                [AuditStatus.IN_PROGRESS]: ['Manager'],
            },
            [AuditStatus.FINALIZED]: {
                [AuditStatus.CLOSED]: ['CAE', 'Admin'],
            },
        };
        return transitions[fromStatus]?.[toStatus] || [];
    }
};
exports.AuditWorkflowService = AuditWorkflowService;
exports.AuditWorkflowService = AuditWorkflowService = __decorate([
    (0, common_1.Injectable)()
], AuditWorkflowService);
//# sourceMappingURL=audit.workflow.js.map