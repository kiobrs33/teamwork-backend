import { Module } from '@nestjs/common';
import { EquipoTeamworkController } from './equipo-teamwork.controller';
import { EquipoTeamworkService } from './equipo-teamwork.service';

@Module({
  controllers: [EquipoTeamworkController],
  providers: [EquipoTeamworkService],
})
export class EquipoTeamworkModule {}
