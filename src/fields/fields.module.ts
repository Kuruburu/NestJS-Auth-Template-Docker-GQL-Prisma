import { Module } from '@nestjs/common';
import { FieldsService } from './fields.service';
import { FieldsResolver } from './fields.resolver';
import { SportsService } from 'src/sports/sports.service';

@Module({
  providers: [FieldsResolver, FieldsService, SportsService],
})
export class FieldsModule {}
