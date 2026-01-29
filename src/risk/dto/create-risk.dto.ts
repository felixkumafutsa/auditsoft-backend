export class CreateRiskDto {
  title: string;
  description?: string;
  category: string;
  impact: string;
  likelihood: string;
  ownerId?: number;
}
