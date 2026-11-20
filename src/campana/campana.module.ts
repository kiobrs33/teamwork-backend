import { Module } from '@nestjs/common';
import { CampanaController } from './campana.controller';
import { CampanaService } from './campana.service';

@Module({
  controllers: [CampanaController],
  providers: [CampanaService],
})
export class CampanaModule {}
