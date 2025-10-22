import { Module } from '@nestjs/common';
import { FieldsService } from './fields.service';
import { FieldsResolver } from './fields.resolver';

@Module({
  providers: [FieldsResolver, FieldsService],
})
export class FieldsModule {}
