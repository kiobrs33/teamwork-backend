import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, Length, Matches } from 'class-validator';

/**
 * Nombre y empresa: los cuatro niveles de la estructura tienen la misma forma.
 * El servicio guarda el nombre recortado y comprueba que no se repita en la
 * empresa (`src/common/estructura/estructura.ts`).
 */
export class CreateUnidadOcupacionalEmpleadoraDto {
  @ApiProperty({
    example: 'Profesionales',
    description: 'Nombre de la unidad ocupacional',
  })
  @IsString({ message: 'Ingrese el nombre.' })
  // `IsNotEmpty` dejaba pasar "   " y el registro quedaba sin nombre.
  @Matches(/\S/, { message: 'Ingrese el nombre.' })
  @Length(3, 100, {
    message: 'El nombre debe tener entre 3 y 100 caracteres.',
  })
  descripcion: string;

  @ApiProperty({ example: 1, description: 'ID de la empresa empleadora' })
  @IsInt({ message: 'Indique la empresa.' })
  idEmpresaEmpleadora: number;
}
