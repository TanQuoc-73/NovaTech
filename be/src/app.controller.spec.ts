import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SupabaseService } from './infrastructure/supabase/supabase.service';

describe('AppController', () => {
  let appController: AppController;
  const supabaseService = {
    healthCheck: jest.fn().mockResolvedValue({
      connected: true,
    }),
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: SupabaseService,
          useValue: supabaseService,
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return api status message', () => {
      expect(appController.getHello()).toBe('NovaTech API is running');
    });
  });

  describe('health', () => {
    it('should return api and supabase health', async () => {
      await expect(appController.getHealth()).resolves.toMatchObject({
        status: 'ok',
        supabase: {
          connected: true,
        },
      });
    });
  });
});
