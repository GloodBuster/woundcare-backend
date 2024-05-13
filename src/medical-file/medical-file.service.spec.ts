import { Test, TestingModule } from '@nestjs/testing';
import { MedicalFileService } from './medical-file.service';

describe('MedicalFileService', () => {
  let service: MedicalFileService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MedicalFileService],
    }).compile();

    service = module.get<MedicalFileService>(MedicalFileService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
