import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LikesController } from './likes.controller';
import { LikesService } from './likes.service';
import { Like } from './entities/like.entity';
import { Post } from '../posts/entities/post.entity';
import { NotificationsModule } from '../notifications/notifications.module';
import { EventsModule } from '../../events/events.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Like, Post]),
    forwardRef(() => NotificationsModule),
    forwardRef(() => EventsModule),
  ],
  controllers: [LikesController],
  providers: [LikesService],
  exports: [LikesService],
})
export class LikesModule {}
