import { Test, TestingModule } from '@nestjs/testing';
import { EmpleoController } from './empleo.controller';
import { EmpleoService } from './empleo.service';

describe('EmpleoController', () => {
  let controller: EmpleoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmpleoController],
      providers: [EmpleoService],
    }).compile();

    controller = module.get<EmpleoController>(EmpleoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
