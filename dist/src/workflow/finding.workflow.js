"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FindingWorkflowService = exports.CAE_FINDING_COMMENT_REQUIRED = exports.FindingSeverity = exports.FindingStatus = void 0;
const common_1 = require("@nestjs/common");
var FindingStatus;
(function (FindingStatus) {
    FindingStatus["IDENTIFIED"] = "Identified";
    FindingStatus["VALIDATED"] = "Validated";
    FindingStatus["ACTION_ASSIGNED"] = "Action Assigned";
    FindingStatus["REMEDIATION_IN_PROGRESS"] = "Remediation In Progress";
    FindingStatus["VERIFIED"] = "Verified";
    FindingStatus["CLOSED"] = "Closed";
})(FindingStatus || (exports.FindingStatus = FindingStatus = {}));
var FindingSeverity;
(function (FindingSeverity) {
    FindingSeverity["CRITICAL"] = "Critical";
    FindingSeverity["HIGH"] = "High";
    FindingSeverity["MEDIUM"] = "Medium";
    FindingSeverity["LOW"] = "Low";
})(FindingSeverity || (exports.FindingSeverity = FindingSeverity = {}));
exports.CAE_FINDING_COMMENT_REQUIRED = [
    { from: 'Remediation In Progress', to: 'Verified' },
    { from: 'Verified', to: 'Closed' },
];
let FindingWorkflowService = class FindingWorkflowService {
    validTransitions = {
        [FindingStatus.IDENTIFIED]: [FindingStatus.VALIDATED],
        [FindingStatus.VALIDATED]: [FindingStatus.ACTION_ASSIGNED],
        [FindingStatus.ACTION_ASSIGNED]: [FindingStatus.REMEDIATION_IN_PROGRESS],
        [FindingStatus.REMEDIATION_IN_PROGRESS]: [FindingStatus.VERIFIED],
        [FindingStatus.VERIFIED]: [FindingStatus.CLOSED],
        [FindingStatus.CLOSED]: [],
    };
    requiresCAEComment(fromStatus, toStatus) {
        return exports.CAE_FINDING_COMMENT_REQUIRED.some(t => t.from === fromStatus && t.to === toStatus);
    }
    canTransition(fromStatus, toStatus) {
        const from = fromStatus;
        const to = toStatus;
        if (!Object.values(FindingStatus).includes(from)) {
            throw new common_1.BadRequestException(`Invalid current status: ${from}`);
        }
        if (!Object.values(FindingStatus).includes(to)) {
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
            [FindingStatus.IDENTIFIED]: {
                [FindingStatus.VALIDATED]: ['Audit Manager', 'Manager'],
            },
            [FindingStatus.VALIDATED]: {
                [FindingStatus.ACTION_ASSIGNED]: ['Audit Manager', 'Manager'],
            },
            [FindingStatus.ACTION_ASSIGNED]: {
                [FindingStatus.REMEDIATION_IN_PROGRESS]: ['Audit Manager', 'Manager', 'Process Owner'],
            },
            [FindingStatus.REMEDIATION_IN_PROGRESS]: {
                [FindingStatus.VERIFIED]: ['Chief Auditor'],
            },
            [FindingStatus.VERIFIED]: {
                [FindingStatus.CLOSED]: ['Chief Auditor'],
            },
        };
        return transitions[fromStatus]?.[toStatus] || [];
    }
    requiresEscalation(severity) {
        return [FindingSeverity.CRITICAL, FindingSeverity.HIGH].includes(severity);
    }
    suggestNextStatus(currentStatus, userRole) {
        const allowed = this.getAllowedTransitions(currentStatus);
        return allowed.filter(status => {
            const permittedRoles = this.getPermittedRoles(currentStatus, status);
            return permittedRoles.includes(userRole);
        });
    }
};
exports.FindingWorkflowService = FindingWorkflowService;
exports.FindingWorkflowService = FindingWorkflowService = __decorate([
    (0, common_1.Injectable)()
], FindingWorkflowService);
//# sourceMappingURL=finding.workflow.js.map