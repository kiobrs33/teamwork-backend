import { Test, TestingModule } from '@nestjs/testing';
import { PuestoEmpleadoraController } from './puesto-empleadora.controller';
import { PuestoEmpleadoraService } from './puesto-empleadora.service';

describe('PuestoEmpleadoraController', () => {
  let controller: PuestoEmpleadoraController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PuestoEmpleadoraController],
      providers: [PuestoEmpleadoraService],
    }).compile();

    controller = module.get<PuestoEmpleadoraController>(PuestoEmpleadoraController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
