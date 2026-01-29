export class CreateKriDto {
  name: string;
  description?: string;
  metricType: string;
  targetValue: number;
  warningThreshold: number;
  criticalThreshold: number;
  currentValue: number;
  frequency: string;
  riskId?: number;
  ownerId?: number;
}
