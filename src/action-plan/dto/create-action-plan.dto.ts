export class CreateActionPlanDto {
  findingId: number;
  description: string;
  ownerId?: number;
  dueDate?: Date;
  status?: string;
}
