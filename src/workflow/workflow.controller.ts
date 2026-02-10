import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuditWorkflowService } from './audit.workflow';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('workflow')
@UseGuards(JwtAuthGuard, RolesGuard)
export class WorkflowController {
  constructor(private readonly auditWorkflow: AuditWorkflowService) {}

  @Get('audit/config')
  @Roles('Admin', 'System Administrator', 'CAE')
  getAuditWorkflowConfig() {
    // Expose the internal structure for UI representation
    return {
      statuses: [
        'Planned', 'Approved', 'Rejected', 'In Progress', 
        'Under Review', 'Execution Finished', 'Finalized', 
        'Process Owner Review', 'Closed'
      ],
      transitions: (this.auditWorkflow as any).validTransitions,
      // We could add more here as needed
    };
  }
}
