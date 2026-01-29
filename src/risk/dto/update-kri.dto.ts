import { PartialType } from '@nestjs/mapped-types';
import { CreateKriDto } from './create-kri.dto';

export class UpdateKriDto extends PartialType(CreateKriDto) {
  status?: string;
  currentValue?: number;
}
