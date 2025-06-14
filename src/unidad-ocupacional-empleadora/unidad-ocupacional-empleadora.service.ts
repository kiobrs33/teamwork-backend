import { Injectable } from '@nestjs/common';
import { CreateUnidadOcupacionalEmpleadoraDto } from './dto/create-unidad-ocupacional-empleadora.dto';
import { UpdateUnidadOcupacionalEmpleadoraDto } from './dto/update-unidad-ocupacional-empleadora.dto';

@Injectable()
export class UnidadOcupacionalEmpleadoraService {
  create(createUnidadOcupacionalEmpleadoraDto: CreateUnidadOcupacionalEmpleadoraDto) {
    return 'This action adds a new unidadOcupacionalEmpleadora';
  }

  findAll() {
    return `This action returns all unidadOcupacionalEmpleadora`;
  }

  findOne(id: number) {
    return `This action returns a #${id} unidadOcupacionalEmpleadora`;
  }

  update(id: number, updateUnidadOcupacionalEmpleadoraDto: UpdateUnidadOcupacionalEmpleadoraDto) {
    return `This action updates a #${id} unidadOcupacionalEmpleadora`;
  }

  remove(id: number) {
    return `This action removes a #${id} unidadOcupacionalEmpleadora`;
  }
}
