import { Module } from '@nestjs/common';
import { UnidadOcupacionalEmpleadoraService } from './unidad-ocupacional-empleadora.service';
import { UnidadOcupacionalEmpleadoraController } from './unidad-ocupacional-empleadora.controller';
import { PdfRendererService } from 'src/reporte/pdf/pdf-renderer.service';

@Module({
  controllers: [UnidadOcupacionalEmpleadoraController],
  providers: [UnidadOcupacionalEmpleadoraService, PdfRendererService],
})
export class UnidadOcupacionalEmpleadoraModule {}
