import { Module, Global } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { StorageService } from './storage.service';
import { StorageController } from './storage.controller';

@Global()
@Module({
  imports: [
    MulterModule.registerAsync({
      imports: [],
      useFactory: async (storageService: StorageService) => {
        return storageService.getMulterConfig();
      },
      inject: [StorageService],
    }),
  ],
  controllers: [StorageController],
  providers: [StorageService],
  exports: [StorageService, MulterModule],
})
export class StorageModule {}
