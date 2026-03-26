
import { Role, NovelType, NovelStatus, NovelLength, NovelGenre, User, Novel, Comment } from './types';

export const INITIAL_USERS: User[] = [
  {
    id: 'u0',
    username: 'BetoBook',
    password: '123',
    roles: [Role.SSR, Role.ADMIN], // SSR Role
    email: 'betobook@betobook.com',
    avatar: 'https://ui-avatars.com/api/?name=BetoBook&background=random&size=200',
    likedNovelIds: []
  },
  {
    id: 'u1',
    username: 'SuperAdmin',
    password: '123',
    roles: [Role.ADMIN, Role.USER],
    email: 'admin@betobook.com',
    avatar: 'https://picsum.photos/seed/admin/200/200',
    likedNovelIds: ['n1']
  },
  {
    id: 'u2',
    username: 'NiceMod',
    password: '123',
    roles: [Role.MOD, Role.TRANSLATOR, Role.USER],
    email: 'mod@betobook.com',
    avatar: 'https://picsum.photos/seed/mod/200/200',
    likedNovelIds: []
  },
  {
    id: 'u3',
    username: 'ReaderOne',
    password: '123',
    roles: [Role.USER],
    email: 'user@betobook.com',
    avatar: 'https://picsum.photos/seed/user/200/200',
    likedNovelIds: ['n2', 'n4']
  }
];

export const INITIAL_NOVELS: Novel[] = [
  {
    id: 'n1',
    title: 'Thế Giới Hoàn Mỹ',
    author: 'Thần Đông',
    description: 'Một hạt bụi có thể lấp biển, một ngọn cỏ chém hết mặt trời mặt trăng và ngôi sao...',
    coverUrl: 'https://picsum.photos/seed/novel1/300/450',
    type: NovelType.TRANSLATED,
    status: NovelStatus.COMPLETED,
    length: NovelLength.SERIES,
    genres: [NovelGenre.FANTASY, NovelGenre.ACTION],
    isPending: false,
    uploaderId: 'u1',
    createdAt: new Date().toISOString()
  },
  {
    id: 'n2',
    title: 'Hành Trình Của Gió',
    author: 'Tác Giả Việt',
    description: 'Câu chuyện về những cơn gió mang theo ký ức của thời gian.',
    coverUrl: 'https://picsum.photos/seed/novel2/300/450',
    type: NovelType.ORIGINAL,
    status: NovelStatus.ONGOING,
    length: NovelLength.SERIES,
    genres: [NovelGenre.SLICE_OF_LIFE, NovelGenre.DRAMA],
    isPending: false,
    uploaderId: 'u3',
    createdAt: new Date().toISOString()
  },
  {
    id: 'n3',
    title: 'Overlord',
    author: 'Maruyama Kugane',
    description: 'Câu chuyện về Momonga, một game thủ bị mắc kẹt trong nhân vật của mình khi server game đóng cửa.',
    coverUrl: 'https://picsum.photos/seed/novel3/300/450',
    type: NovelType.TRANSLATED,
    status: NovelStatus.PAUSED,
    length: NovelLength.SERIES,
    genres: [NovelGenre.ISEKAI, NovelGenre.FANTASY],
    isPending: false,
    uploaderId: 'u2',
    createdAt: new Date().toISOString()
  },
  {
    id: 'n4',
    title: 'Mùa Hè Năm Ấy',
    author: 'Nguyễn Nhật Ánh (Fanfic)',
    description: 'Một câu chuyện ngắn về tình yêu tuổi học trò ngây ngô.',
    coverUrl: 'https://picsum.photos/seed/novel4/300/450',
    type: NovelType.ORIGINAL,
    status: NovelStatus.COMPLETED,
    length: NovelLength.ONESHOT,
    genres: [NovelGenre.ROMANCE],
    isPending: false,
    uploaderId: 'u3',
    createdAt: new Date().toISOString()
  }
];

export const INITIAL_COMMENTS: Comment[] = [
  {
    id: 'c1',
    novelId: 'n1',
    userId: 'u3',
    username: 'ReaderOne',
    userAvatar: 'https://picsum.photos/seed/user/200/200',
    content: 'Truyện hay quá, main bá đạo!',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    roles: [Role.USER]
  },
  {
    id: 'c2',
    novelId: 'n1',
    userId: 'u2',
    username: 'NiceMod',
    userAvatar: 'https://picsum.photos/seed/mod/200/200',
    content: 'Bản dịch rất mượt, cảm ơn nhóm dịch.',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    roles: [Role.MOD, Role.TRANSLATOR]
  }
];