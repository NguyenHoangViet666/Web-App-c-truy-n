import { Router } from 'express';
import authRoutes from './routes/auth';
import novelRoutes from './routes/novels';
import chapterRoutes from './routes/chapters';
import userRoutes from './routes/users';
import forumRoutes from './routes/forum';
import commentRoutes from './routes/comments';
import messageRoutes from './routes/messages';
import friendRoutes from './routes/friends';
import roleRoutes from './routes/roles';

const router = Router();

router.use('/auth', authRoutes);
router.use('/novels', novelRoutes);
router.use('/chapters', chapterRoutes);
router.use('/users', userRoutes);
router.use('/forum', forumRoutes);
router.use('/comments', commentRoutes);
router.use('/messages', messageRoutes);
router.use('/friends', friendRoutes);
router.use('/roles', roleRoutes);

export default router;
