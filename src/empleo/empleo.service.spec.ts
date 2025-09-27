import { Test, TestingModule } from '@nestjs/testing';
import { EmpleoService } from './empleo.service';

describe('EmpleoService', () => {
  let service: EmpleoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmpleoService],
    }).compile();

    service = module.get<EmpleoService>(EmpleoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
