import { Test, TestingModule } from '@nestjs/testing';
import { EmpresaEmpleadoraController } from './empresa-empleadora.controller';
import { EmpresaEmpleadoraService } from './empresa-empleadora.service';

describe('EmpresaEmpleadoraController', () => {
  let controller: EmpresaEmpleadoraController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmpresaEmpleadoraController],
      providers: [EmpresaEmpleadoraService],
    }).compile();

    controller = module.get<EmpresaEmpleadoraController>(EmpresaEmpleadoraController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
