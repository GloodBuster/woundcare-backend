import { Test, TestingModule } from '@nestjs/testing';
import { MedicalFileController } from './medical-file.controller';
import { MedicalFileService } from './medical-file.service';

describe('MedicalFileController', () => {
  let controller: MedicalFileController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MedicalFileController],
      providers: [MedicalFileService],
    }).compile();

    controller = module.get<MedicalFileController>(MedicalFileController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
