import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

export class IniciarEvaluacionDto {
  @ApiProperty({
    example: 1032,
    description: 'ID del trabajador evaluado',
  })
  @IsInt({ message: 'idEvaluado debe ser un número entero.' })
  idEvaluado: number;

  @ApiProperty({
    example: 550,
    description: 'ID del evaluador (jefe o autoevaluación)',
  })
  @IsInt({ message: 'idEvaluador debe ser un número entero.' })
  idEvaluador: number;

  @ApiProperty({
    example: 9,
    description: 'ID de la competencia a evaluar',
  })
  @IsInt({ message: 'idCompetencia debe ser un número entero.' })
  idCompetencia: number;

  @ApiProperty({
    example: 27,
    description:
      'ID del nivel de la competencia asignado a la unidad del trabajador',
  })
  @IsInt({ message: 'idCompetenciaNivel debe ser un número entero.' })
  idCompetenciaNivel: number;
}
