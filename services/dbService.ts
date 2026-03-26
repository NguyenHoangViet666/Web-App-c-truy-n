import { User, Novel, Role, Comment, Reply, NovelType, NovelStatus, NovelGenre, NovelLength, Chapter, Notification, NotificationType, Post, ForumTopic, RoleRequest, RoleRequestStatus, Conversation, Message, Rating } from '../types';

// Cloudinary Configuration
const CLOUDINARY_CLOUD_NAME = 'ddpcskrud';
const CLOUDINARY_UPLOAD_PRESET = 'BetoTest';
const CLOUDINARY_API_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

// --- STORAGE SERVICES (CLOUDINARY & BASE64 FALLBACK) ---

export const uploadImage = async (file: File): Promise<string> => {
  const toBase64 = (file: File): Promise<string> => {
      return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = error => reject(error);
      });
  };

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

  try {
    const response = await fetch(CLOUDINARY_API_URL, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Cloudinary upload failed');
    }

    const data = await response.json();
    if (!data.secure_url) throw new Error('No url returned');
    
    return data.secure_url;
  } catch (error) {
    console.warn("Cloudinary Upload Error, using Base64 fallback:", error);
    return await toBase64(file);
  }
};

// --- USER SERVICES ---

export const getUserById = async (id: string): Promise<User | null> => {
  if (!id) return null;
  try {
    const res = await fetch(`/api/users/${id}`);
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    console.error("Lỗi lấy user:", e);
    return null;
  }
};

export const getUsers = async (): Promise<User[]> => {
  try {
    const res = await fetch('/api/users', { headers: getAuthHeaders() });
    if (!res.ok) return [];
    return await res.json();
  } catch (e) { console.error(e); return []; }
};

export const updateUserRoles = async (userId: string, newRoles: Role[]): Promise<void> => {
  try {
    await fetch(`/api/users/${userId}/roles`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ roles: newRoles })
    });
  } catch (e) { console.error(e); }
};

export const addRoleToUser = async (userId: string, roleToAdd: Role): Promise<void> => {
  try {
    const user = await getUserById(userId);
    if (user && !user.roles.includes(roleToAdd)) {
      await updateUserRoles(userId, [...user.roles, roleToAdd]);
    }
  } catch (e) { console.error(e); }
};

export const removeRoleFromUser = async (userId: string, roleToRemove: Role): Promise<void> => {
  try {
    const user = await getUserById(userId);
    if (user && user.roles.includes(roleToRemove)) {
      await updateUserRoles(userId, user.roles.filter(r => r !== roleToRemove));
    }
  } catch (e) { console.error(e); }
};

export const deleteUser = async (userId: string): Promise<User[]> => {
  try {
    await fetch(`/api/users/${userId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return getUsers();
  } catch (e) { console.error(e); return []; }
};

export const toggleNovelLike = async (userId: string, novelId: string): Promise<User | null> => {
  try {
    const res = await fetch(`/api/users/like/${novelId}`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    if (!res.ok) return null;
    return await getUserById(userId);
  } catch (e) {
    console.error(e);
    return null;
  }
};

export const updateUserProfileData = async (userId: string, data: Partial<User>): Promise<void> => {
  try {
    await fetch('/api/users/me', {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
  } catch (e) { console.error(e); }
};

// --- FRIENDSHIP SERVICES ---

export const sendFriendRequest = async (fromUser: User, toUserId: string): Promise<void> => {
  try {
    await fetch(`/api/friends/request/${toUserId}`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
  } catch (e) { console.error(e); }
};

export const cancelFriendRequest = async (fromUserId: string, toUserId: string): Promise<void> => {
  try {
    await fetch(`/api/friends/cancel/${toUserId}`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
  } catch (e) { console.error(e); }
};

export const acceptFriendRequest = async (currentUser: User, fromUserId: string): Promise<void> => {
  try {
    await fetch(`/api/friends/accept/${fromUserId}`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
  } catch (e) { console.error(e); }
};

export const unfriend = async (userId1: string, userId2: string): Promise<void> => {
  try {
    // Assuming currentUser is userId1
    await fetch(`/api/friends/unfriend/${userId2}`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
  } catch (e) { console.error(e); }
};

// --- MESSAGING SERVICES ---

export const getConversations = async (userId: string): Promise<Conversation[]> => {
  try {
    const res = await fetch('/api/messages', { headers: getAuthHeaders() });
    if (!res.ok) return [];
    return await res.json();
  } catch (e) { console.error(e); return []; }
};

export const getConversationByPartner = async (userId: string, partnerId: string): Promise<Conversation | null> => {
  try {
    const res = await fetch(`/api/messages/partner/${partnerId}`, { headers: getAuthHeaders() });
    if (!res.ok) return null;
    return await res.json();
  } catch (e) { console.error(e); return null; }
};

export const getMessages = async (conversationId: string): Promise<Message[]> => {
  try {
    const res = await fetch(`/api/messages/${conversationId}`, { headers: getAuthHeaders() });
    if (!res.ok) return [];
    return await res.json();
  } catch (e) { console.error(e); return []; }
};

export const sendMessage = async (fromUser: User, toUserId: string, content: string): Promise<void> => {
  try {
    await fetch('/api/messages', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ toUserId, content })
    });
  } catch (e) { console.error(e); }
};

export const markConversationAsRead = async (conversationId: string, userId: string): Promise<void> => {
  try {
    await fetch(`/api/messages/${conversationId}/read`, {
      method: 'PUT',
      headers: getAuthHeaders()
    });
  } catch (e) { console.error(e); }
};

export const getUnreadMessageCount = async (userId: string): Promise<number> => {
  try {
    const res = await fetch('/api/messages/unread/count', { headers: getAuthHeaders() });
    if (!res.ok) return 0;
    const data = await res.json();
    return data.total;
  } catch (e) { return 0; }
};

// --- NOTIFICATION SERVICES ---

export const getUserNotifications = async (userId: string): Promise<Notification[]> => {
  try {
    const res = await fetch('/api/users/me/notifications', { headers: getAuthHeaders() });
    if (!res.ok) return [];
    return await res.json();
  } catch (e) { console.error(e); return []; }
};

export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
  try {
    await fetch(`/api/users/notifications/${notificationId}/read`, {
      method: 'PUT',
      headers: getAuthHeaders()
    });
  } catch (e) { console.error(e); }
};

export const markAllNotificationsAsRead = async (userId: string): Promise<void> => {
  try {
    await fetch('/api/users/notifications/read-all', {
      method: 'PUT',
      headers: getAuthHeaders()
    });
  } catch (e) { console.error(e); }
};

// --- NOVEL SERVICES ---

export const getNovelsByUploader = async (uploaderId: string): Promise<Novel[]> => {
  try {
    const res = await fetch(`/api/novels/uploader/${uploaderId}`);
    if (!res.ok) return [];
    return await res.json();
  } catch (e) { console.error(e); return []; }
};

export const getNovels = async (): Promise<Novel[]> => {
  try {
    const res = await fetch('/api/novels');
    if (!res.ok) return [];
    return await res.json();
  } catch (e) { console.error(e); return []; }
};

export const getPublicNovels = async (): Promise<Novel[]> => {
  try {
    const res = await fetch('/api/novels?isPending=false');
    if (!res.ok) return [];
    return await res.json();
  } catch (e) { console.error(e); return []; }
};

export const getNovelById = async (id: string): Promise<Novel | null> => {
  if (!id) return null;
  try {
    const res = await fetch(`/api/novels/${id}`);
    if (!res.ok) return null;
    return await res.json();
  } catch (e) { console.error(e); return null; }
};

export const addNovel = async (novel: Omit<Novel, 'id' | 'createdAt' | 'isPending' | 'isFeatured'>, isPending: boolean = true): Promise<Novel[]> => {
  try {
    await fetch('/api/novels', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ ...novel, isPending })
    });
    return getNovels();
  } catch (e) { console.error(e); return []; }
};

export const updateNovel = async (id: string, data: Partial<Novel>): Promise<void> => {
  try {
    const res = await fetch(`/api/novels/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      throw new Error(await res.text());
    }
  } catch (e) { console.error(e); throw e; }
};

export const toggleNovelFeature = async (id: string): Promise<void> => {
  try {
    const novel = await getNovelById(id);
    if (novel) {
      await updateNovel(id, { isFeatured: !novel.isFeatured });
    }
  } catch (e) { console.error(e); throw e; }
};

export const approveNovel = async (id: string): Promise<Novel[]> => {
  try {
    await updateNovel(id, { isPending: false });
    return getNovels();
  } catch (e) { console.error(e); throw e; }
};

export const deleteNovel = async (id: string): Promise<Novel[]> => {
  try {
    const res = await fetch(`/api/novels/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!res.ok) {
        throw new Error(await res.text());
    }
    return getNovels();
  } catch (e) { console.error(e); throw e; }
};

// --- RATING SERVICES ---

export const getUserRating = async (novelId: string, userId: string): Promise<Rating | null> => {
  try {
    const res = await fetch(`/api/novels/${novelId}/rating`, { headers: getAuthHeaders() });
    if (!res.ok) return null;
    return await res.json();
  } catch (e) { console.error(e); return null; }
};

export const rateNovel = async (novelId: string, userId: string, score: number): Promise<void> => {
  try {
    await fetch(`/api/novels/${novelId}/rate`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ score })
    });
  } catch (e) { console.error(e); }
};

// --- CHAPTER SERVICES ---

export const getChapters = async (novelId: string): Promise<Chapter[]> => {
  try {
    const res = await fetch(`/api/chapters/novel/${novelId}`);
    if (!res.ok) return [];
    return await res.json();
  } catch (e) { console.error(e); return []; }
};

export const getChapterDetail = async (chapterId: string): Promise<Chapter | null> => {
  if (!chapterId) return null;
  try {
    const res = await fetch(`/api/chapters/${chapterId}`);
    if (!res.ok) return null;
    return await res.json();
  } catch (e) { console.error(e); return null; }
};

export const addChapter = async (novelId: string, title: string, content: string): Promise<void> => {
  try {
    const res = await fetch('/api/chapters', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ novelId, title, content })
    });
    if (!res.ok) {
        throw new Error(await res.text());
    }
  } catch (e) { 
    console.error(e);
    throw e;
  }
};

export const updateChapter = async (chapterId: string, title: string, content: string): Promise<void> => {
  try {
    await fetch(`/api/chapters/${chapterId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ title, content })
    });
  } catch (e) { console.error(e); }
};

export const deleteChapter = async (chapterId: string): Promise<void> => {
  const res = await fetch(`/api/chapters/${chapterId}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Xóa chương thất bại');
  }
};

// --- COMMENT SERVICES ---

export const getComments = async (novelId?: string, postId?: string): Promise<Comment[]> => {
  try {
    let url = '';
    if (novelId) url = `/api/comments/novel/${novelId}`;
    else if (postId) url = `/api/comments/post/${postId}`;
    else return [];

    const res = await fetch(url);
    if (!res.ok) return [];
    return await res.json();
  } catch (e) { console.error(e); return []; }
};

export const addComment = async (comment: Omit<Comment, 'id' | 'createdAt'>): Promise<void> => {
  try {
    await fetch('/api/comments', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(comment)
    });
  } catch (e) { console.error(e); }
};

export const deleteComment = async (commentId: string): Promise<void> => {
  try {
    await fetch(`/api/comments/${commentId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
  } catch (e) { console.error(e); }
};

export const toggleCommentLike = async (commentId: string, userId: string): Promise<void> => {
  try {
    await fetch(`/api/comments/${commentId}/like`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
  } catch (e) { console.error(e); }
};

export const addReply = async (commentId: string, reply: Omit<Reply, 'id' | 'createdAt'>): Promise<void> => {
  try {
    await fetch(`/api/comments/${commentId}/reply`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(reply)
    });
  } catch (e) { console.error(e); }
};

// --- FORUM SERVICES ---

export const getPosts = async (topic?: ForumTopic): Promise<Post[]> => {
  try {
    const url = topic ? `/api/forum?topic=${topic}` : '/api/forum';
    const res = await fetch(url);
    if (!res.ok) return [];
    return await res.json();
  } catch (e) { console.error(e); return []; }
};

export const getPostsByAuthor = async (userId: string): Promise<Post[]> => {
  try {
    const res = await fetch(`/api/forum/user/${userId}`);
    if (!res.ok) return [];
    return await res.json();
  } catch (e) { console.error(e); return []; }
};

export const getPostById = async (id: string): Promise<Post | null> => {
  try {
    const res = await fetch(`/api/forum/${id}`);
    if (!res.ok) return null;
    return await res.json();
  } catch (e) { console.error(e); return null; }
};

export const createPost = async (post: Omit<Post, 'id' | 'createdAt' | 'viewCount' | 'likeCount'>): Promise<void> => {
  try {
    await fetch('/api/forum', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(post)
    });
  } catch (e) { console.error(e); }
};

export const updatePost = async (id: string, data: Partial<Post>): Promise<void> => {
  try {
    const res = await fetch(`/api/forum/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      throw new Error(await res.text());
    }
  } catch (e) { console.error(e); throw e; }
};

export const deletePost = async (id: string): Promise<void> => {
  try {
    await fetch(`/api/forum/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
  } catch (e) { console.error(e); }
};

// --- ROLE REQUEST SERVICES ---

export const createRoleRequest = async (user: User, requestedRole: Role.AUTHOR | Role.TRANSLATOR, reason: string): Promise<void> => {
  try {
    const res = await fetch('/api/roles/request', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ requestedRole, reason })
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message || 'Failed to create role request');
    }
  } catch (e) { 
    console.error(e); 
    throw e;
  }
};

export const getRoleRequests = async (): Promise<RoleRequest[]> => {
  try {
    const res = await fetch('/api/roles/requests', { headers: getAuthHeaders() });
    if (!res.ok) return [];
    return await res.json();
  } catch (e) { console.error(e); return []; }
};

export const updateRoleRequestStatus = async (requestId: string, status: RoleRequestStatus): Promise<void> => {
  try {
    await fetch(`/api/roles/requests/${requestId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status })
    });
  } catch (e) { console.error(e); }
};

export const checkUserPendingRequest = async (userId: string): Promise<RoleRequest | null> => {
  try {
    const res = await fetch(`/api/roles/requests/user/${userId}`, { headers: getAuthHeaders() });
    if (!res.ok) return null;
    return await res.json();
  } catch (e) { console.error(e); return null; }
};

export const processRoleRequest = async (requestId: string, approved: boolean, userId: string, role: Role): Promise<void> => {
  try {
    await updateRoleRequestStatus(requestId, approved ? RoleRequestStatus.APPROVED : RoleRequestStatus.REJECTED);
  } catch (e) { console.error(e); }
};


