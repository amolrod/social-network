import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FollowsController } from './follows.controller';
import { FollowsService } from './follows.service';
import { Follow } from './entities/follow.entity';
import { User } from '../users/entities/user.entity';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Follow, User]),
    forwardRef(() => NotificationsModule),
  ],
  controllers: [FollowsController],
  providers: [FollowsService],
  exports: [FollowsService], // Exportar para usar en otros módulos (ej: Posts)
})
export class FollowsModule {}
