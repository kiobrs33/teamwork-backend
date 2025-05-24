import { Test, TestingModule } from '@nestjs/testing';
import { UnidadEmpleadoraService } from './unidad-empleadora.service';

describe('UnidadEmpleadoraService', () => {
  let service: UnidadEmpleadoraService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UnidadEmpleadoraService],
    }).compile();

    service = module.get<UnidadEmpleadoraService>(UnidadEmpleadoraService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
