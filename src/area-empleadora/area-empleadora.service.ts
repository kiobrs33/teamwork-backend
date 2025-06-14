import { Injectable } from '@nestjs/common';
import { CreateAreaEmpleadoraDto } from './dto/create-area-empleadora.dto';
import { UpdateAreaEmpleadoraDto } from './dto/update-area-empleadora.dto';

@Injectable()
export class AreaEmpleadoraService {
  create(createAreaEmpleadoraDto: CreateAreaEmpleadoraDto) {
    return 'This action adds a new areaEmpleadora';
  }

  findAll() {
    return `This action returns all areaEmpleadora`;
  }

  findOne(id: number) {
    return `This action returns a #${id} areaEmpleadora`;
  }

  update(id: number, updateAreaEmpleadoraDto: UpdateAreaEmpleadoraDto) {
    return `This action updates a #${id} areaEmpleadora`;
  }

  remove(id: number) {
    return `This action removes a #${id} areaEmpleadora`;
  }
}
