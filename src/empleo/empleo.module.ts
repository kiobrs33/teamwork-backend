import { Module } from '@nestjs/common';
import { EmpleoService } from './empleo.service';
import { EmpleoController } from './empleo.controller';

@Module({
  controllers: [EmpleoController],
  providers: [EmpleoService],
})
export class EmpleoModule {}
