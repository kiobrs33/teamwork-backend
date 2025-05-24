import { Test, TestingModule } from '@nestjs/testing';
import { EquipoEmpleadoraService } from './equipo-empleadora.service';

describe('EquipoEmpleadoraService', () => {
  let service: EquipoEmpleadoraService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EquipoEmpleadoraService],
    }).compile();

    service = module.get<EquipoEmpleadoraService>(EquipoEmpleadoraService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
