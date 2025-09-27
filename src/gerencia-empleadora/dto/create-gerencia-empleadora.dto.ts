import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateGerenciaEmpleadoraDto {
  @ApiProperty({
    example: 'Gerencia A',
    description: 'Descripción de la gerencia empleadora',
  })
  @IsString()
  @IsNotEmpty({ message: 'La descripción es obligatoria.' })
  descripcion: string;

  @ApiProperty({ example: 1, description: 'ID de la gerencia empleadora' })
  @IsNumber({}, { message: 'El ID de gerencia empleadora debe ser un número.' })
  idEmpresaEmpleadora: number;
}
