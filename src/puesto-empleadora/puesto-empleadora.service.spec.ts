import { Test, TestingModule } from '@nestjs/testing';
import { PuestoEmpleadoraService } from './puesto-empleadora.service';

describe('PuestoEmpleadoraService', () => {
  let service: PuestoEmpleadoraService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PuestoEmpleadoraService],
    }).compile();

    service = module.get<PuestoEmpleadoraService>(PuestoEmpleadoraService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
