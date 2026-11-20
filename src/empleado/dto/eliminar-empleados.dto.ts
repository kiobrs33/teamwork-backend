import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class EliminarEmpleadosDto {
  @ApiProperty({
    type: [Number],
    example: [12, 15, 31],
    description: 'IDs de los empleados a dar de baja.',
  })
  @IsArray()
  @ArrayNotEmpty()
  @Type(() => Number)
  @IsInt({ each: true })
  ids: number[];
}
