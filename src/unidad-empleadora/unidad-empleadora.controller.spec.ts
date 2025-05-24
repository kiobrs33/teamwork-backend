import { Test, TestingModule } from '@nestjs/testing';
import { UnidadEmpleadoraController } from './unidad-empleadora.controller';
import { UnidadEmpleadoraService } from './unidad-empleadora.service';

describe('UnidadEmpleadoraController', () => {
  let controller: UnidadEmpleadoraController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UnidadEmpleadoraController],
      providers: [UnidadEmpleadoraService],
    }).compile();

    controller = module.get<UnidadEmpleadoraController>(UnidadEmpleadoraController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
