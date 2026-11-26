import { Module } from '@nestjs/common';
import { PlataformaController } from './plataforma.controller';
import { PlataformaService } from './plataforma.service';

@Module({
  controllers: [PlataformaController],
  providers: [PlataformaService],
})
export class PlataformaModule {}
