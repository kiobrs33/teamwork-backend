import { Test, TestingModule } from '@nestjs/testing';
import { EmpresaEmpleadoraService } from './empresa-empleadora.service';

describe('EmpresaEmpleadoraService', () => {
  let service: EmpresaEmpleadoraService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmpresaEmpleadoraService],
    }).compile();

    service = module.get<EmpresaEmpleadoraService>(EmpresaEmpleadoraService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
