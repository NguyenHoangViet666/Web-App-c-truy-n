
import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { Post, Comment, Role, ForumTopic } from '../types';
import { getPostById, deletePost, getComments, addComment, toggleCommentLike, addReply, updatePost } from '../services/dbService';
import { ThumbsUp, MessageSquare, Eye, Clock, Send, Loader2, ArrowLeft, MoreHorizontal, User, Calendar, Pin, Trash2, Edit, X, Save, CheckCircle } from 'lucide-react';
import { RoleBadge } from '../components/RoleBadge';

const formatDate = (dateStr: any) => {
    if (!dateStr) return 'Đang cập nhật...';
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? 'Đang cập nhật...' : date.toLocaleDateString('vi-VN');
};
export const PostDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { currentUser, isAdmin, isMod } = useAuth();
    const { showToast, showConfirm } = useNotification();
    
    const [post, setPost] = useState<Post | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);

    // Comment State
    const [commentContent, setCommentContent] = useState('');
    const [processingComment, setProcessingComment] = useState(false);
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyContent, setReplyContent] = useState('');

    // Pin State
    const [isPinModalOpen, setIsPinModalOpen] = useState(false);
    const [pinning, setPinning] = useState(false);

    // Edit State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editForm, setEditForm] = useState({
        title: '',
        topic: ForumTopic.GENERAL,
        content: ''
    });
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        const fetch = async () => {
            if (!id) return;
            setLoading(true);
            const [p, c] = await Promise.all([
                getPostById(id),
                getComments(undefined, id)
            ]);
            setPost(p);
            setComments(c);
            setLoading(false);
        };
        fetch();
    }, [id]);

    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser || !id || !commentContent.trim()) return;

        setProcessingComment(true);
        try {
            await addComment({
                postId: id,
                userId: currentUser.id,
                userAvatar: currentUser.avatar,
                username: currentUser.username,
                roles: currentUser.roles,
                content: commentContent.trim(),
                likedBy: [],
                replies: []
            });
            const updatedComments = await getComments(undefined, id);
            setComments(updatedComments);
            setCommentContent('');
        } catch (e) {
            console.error(e);
        } finally {
            setProcessingComment(false);
        }
    };

    const handleReplySubmit = async (commentId: string) => {
        if (!currentUser || !replyContent.trim()) return;
        try {
            await addReply(commentId, {
                userId: currentUser.id,
                userAvatar: currentUser.avatar,
                username: currentUser.username,
                roles: currentUser.roles,
                content: replyContent.trim()
            });
            if (id) {
                const updated = await getComments(undefined, id);
                setComments(updated);
            }
            setReplyingTo(null);
            setReplyContent('');
        } catch (e) {
            console.error(e);
        }
    };

    // New: Reply to Sub-comment (Tagging)
    const handleReplyToSubComment = (rootCommentId: string, usernameToTag: string) => {
        setReplyingTo(rootCommentId);
        setReplyContent(`@${usernameToTag} `);
    };

    const handleLikeComment = async (commentId: string) => {
        if (!currentUser) return showToast("Vui lòng đăng nhập!", 'info');
        await toggleCommentLike(commentId, currentUser.id);
        // Optimistic update
        setComments(prev => prev.map(c => {
             if (c.id === commentId) {
                 const likedBy = c.likedBy || [];
                 const hasLiked = likedBy.includes(currentUser.id);
                 return { ...c, likedBy: hasLiked ? likedBy.filter(uid => uid !== currentUser.id) : [...likedBy, currentUser.id] };
             }
             return c;
        }));
    };

    const handleDeletePost = async () => {
        if (!post) return;
        showConfirm("Bạn có chắc chắn muốn xóa bài viết này?", async () => {
            await deletePost(post.id);
            navigate('/forum');
        });
    };

    // --- PIN LOGIC ---
    const handlePinPost = async (days: number | null) => {
        if (!id) return;
        setPinning(true);
        try {
            let pinnedUntilStr: string | null = null;
            if (days !== null) {
                const pinnedUntil = new Date();
                pinnedUntil.setDate(pinnedUntil.getDate() + days);
                pinnedUntilStr = pinnedUntil.toISOString();
            }
            await updatePost(id, { isPinned: true, pinnedUntil: pinnedUntilStr as any });
            const updated = await getPostById(id);
            setPost(updated);
            setIsPinModalOpen(false);
            showToast("Đã ghim bài viết!", 'success');
        } catch (e: any) {
            console.error(e);
            showToast("Lỗi khi ghim bài: " + e.message, 'error');
        } finally {
            setPinning(false);
        }
    };

    const handleUnpinPost = async () => {
        if (!id) return;
        showConfirm("Bỏ ghim bài viết này?", async () => {
            setPinning(true);
            try {
                await updatePost(id, { isPinned: false, pinnedUntil: undefined });
                const updated = await getPostById(id);
                setPost(updated);
                showToast("Đã bỏ ghim.", 'success');
            } catch (e: any) {
                console.error(e);
                showToast("Lỗi khi bỏ ghim: " + e.message, 'error');
            } finally {
                setPinning(false);
            }
        });
    };

    // --- EDIT LOGIC ---
    const openEditModal = () => {
        if (post) {
            setEditForm({
                title: post.title,
                topic: post.topic,
                content: post.content
            });
            setIsEditModalOpen(true);
        }
    };

    const handleUpdatePost = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!post || !id) return;
        
        setUpdating(true);
        try {
            await updatePost(id, editForm);
            setPost({ ...post, ...editForm });
            setIsEditModalOpen(false);
            showToast("Cập nhật bài viết thành công!", 'success');
        } catch (e: any) {
            console.error(e);
            showToast("Lỗi khi cập nhật: " + e.message, 'error');
        } finally {
            setUpdating(false);
        }
    };

    // Calculate total comments including replies
    const totalCommentCount = useMemo(() => {
      return comments.reduce((acc, comment) => {
          const replyCount = comment.replies?.length || 0;
          return acc + 1 + replyCount;
      }, 0);
    }, [comments]);

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin w-8 h-8 text-primary"/></div>;
    if (!post) return <div className="text-center p-12">Bài viết không tồn tại.</div>;

    const canDelete = currentUser && (isAdmin || isMod || currentUser.id === post.authorId);
    const canEdit = currentUser && (isAdmin || isMod || currentUser.id === post.authorId);
    const canPin = isAdmin;

    // Check if pin is active (for display purposes)
    const isPinnedActive = post.isPinned && (!post.pinnedUntil || new Date(post.pinnedUntil) > new Date());
    const pinnedText = post.pinnedUntil ? `đến ${formatDate(post.pinnedUntil)}` : 'Vĩnh viễn';

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <Link to="/forum" className="inline-flex items-center text-slate-500 dark:text-slate-400 dark:text-slate-500 hover:text-primary mb-6">
                <ArrowLeft className="w-4 h-4 mr-1"/> Quay lại diễn đàn
            </Link>

            {/* POST CONTENT */}
            <div className={`bg-white/90 dark:bg-[#1a1b26]/90 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border overflow-hidden mb-8 ${isPinnedActive ? 'border-fuchsia-300 ring-1 ring-fuchsia-100/50' : 'border-purple-100/50 dark:border-purple-900/50'}`}>
                <div className="p-6 border-b border-purple-100/50 dark:border-purple-900/50 bg-white/50 dark:bg-[#1a1b26]/50 flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                             {isPinnedActive && (
                                 <span className="bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold uppercase flex items-center shadow-sm shadow-fuchsia-500/30">
                                     <Pin className="w-3 h-3 mr-1 fill-white"/> Đã ghim ({pinnedText})
                                 </span>
                             )}
                             <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded font-bold uppercase">{post.topic}</span>
                             <span className="text-slate-400 dark:text-slate-500 text-xs flex items-center"><Calendar className="w-3 h-3 mr-1"/> {formatDate(post.createdAt)}</span>
                             <span className="text-slate-400 dark:text-slate-500 text-xs flex items-center"><Eye className="w-3 h-3 mr-1"/> {post.viewCount} views</span>
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{post.title}</h1>
                    </div>
                    
                    <div className="flex gap-2">
                         {canPin && (
                             /* If it is marked as pinned (even if expired), show Unpin button so Admin can clear it */
                             post.isPinned ? (
                                <button onClick={handleUnpinPost} disabled={pinning} className="text-fuchsia-500 hover:bg-fuchsia-50 p-2 rounded-full transition-colors" title="Bỏ ghim">
                                    <div className="relative">
                                        <Pin className="w-5 h-5 fill-current"/>
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-0.5 bg-white dark:bg-[#1a1b26] rotate-45"></div>
                                    </div>
                                </button>
                             ) : (
                                <button onClick={()=>setIsPinModalOpen(true)} className="text-slate-400 dark:text-slate-500 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors" title="Ghim bài viết">
                                    <Pin className="w-5 h-5"/>
                                </button>
                             )
                         )}

                        {canEdit && (
                             <button onClick={openEditModal} className="text-slate-400 dark:text-slate-500 hover:text-blue-600 p-2 hover:bg-blue-50 dark:bg-blue-900/20 rounded-full transition-colors" title="Sửa bài">
                                 <Edit className="w-5 h-5"/>
                             </button>
                        )}

                        {canDelete && (
                            <button onClick={handleDeletePost} className="text-slate-400 dark:text-slate-500 hover:text-red-600 p-2 hover:bg-red-50 rounded-full transition-colors" title="Xóa bài">
                                <Trash2 className="w-5 h-5"/>
                            </button>
                        )}
                    </div>
                </div>
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-6 p-3 bg-slate-50 dark:bg-[#0f1016] rounded-lg w-fit">
                        <Link to={`/user/${post.authorId}`}>
                            <img src={post.authorAvatar || 'https://via.placeholder.com/40'} className="w-10 h-10 rounded-full hover:opacity-80 transition-opacity" alt=""/>
                        </Link>
                        <div>
                            <div className="font-bold text-sm flex items-center">
                                <Link to={`/user/${post.authorId}`} className="hover:text-primary mr-1">
                                    {post.authorName}
                                </Link>
                                <RoleBadge roles={post.authorRoles}/>
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500">Người đăng</div>
                        </div>
                    </div>
                    <div className="prose max-w-none text-slate-700 dark:text-slate-200 whitespace-pre-wrap">
                        {post.content}
                    </div>
                </div>
            </div>

            {/* COMMENTS SECTION */}
            <div className="bg-white/80 dark:bg-[#1a1b26]/80 backdrop-blur-md rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-purple-100/50 dark:border-purple-900/50 p-6">
                <h3 className="font-bold text-xl mb-6 flex items-center text-slate-800 dark:text-slate-100"><MessageSquare className="w-6 h-6 mr-2 text-primary"/> Bình luận ({totalCommentCount})</h3>

                {currentUser ? (
                    <form onSubmit={handleCommentSubmit} className="mb-8 flex gap-3">
                        <img src={currentUser.avatar} className="w-12 h-12 rounded-full shadow-sm" alt=""/>
                        <div className="flex-1">
                            <textarea 
                                value={commentContent}
                                onChange={e => setCommentContent(e.target.value)}
                                className="w-full border border-purple-100/50 dark:border-purple-900/50 bg-white/50 dark:bg-[#1a1b26]/50 rounded-2xl p-4 focus:ring-2 focus:ring-primary/30 outline-none resize-none h-24 text-sm shadow-inner transition-all"
                                placeholder="Viết bình luận của bạn..."
                            />
                            <div className="flex justify-end mt-3">
                                <button 
                                    type="submit" 
                                    disabled={processingComment || !commentContent.trim()} 
                                    className="bg-gradient-to-r from-primary to-purple-600 hover:from-purple-600 hover:to-primary text-white px-6 py-2.5 rounded-xl text-sm font-bold flex items-center shadow-lg shadow-primary/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {processingComment ? <Loader2 className="animate-spin w-4 h-4 mr-2"/> : <Send className="w-4 h-4 mr-2"/>} Gửi
                                </button>
                            </div>
                        </div>
                    </form>
                ) : (
                    <div className="bg-slate-50 dark:bg-[#0f1016] p-4 rounded text-center text-sm mb-6">
                        <Link to="/login" className="text-primary font-bold hover:underline">Đăng nhập</Link> để tham gia thảo luận.
                    </div>
                )}

                <div className="space-y-6">
                    {comments.map(c => {
                        const isLiked = currentUser && c.likedBy?.includes(currentUser.id);
                        const likesCount = c.likedBy?.length || 0;
                        return (
                            <div key={c.id} className="flex gap-3">
                                <Link to={`/user/${c.userId}`}>
                                    <img src={c.userAvatar} className="w-10 h-10 rounded-full flex-shrink-0 hover:border-primary border border-transparent transition-all" alt=""/>
                                </Link>
                                <div className="flex-1">
                                    <div className="bg-white/60 dark:bg-[#1a1b26]/60 shadow-sm border border-purple-50/50 p-4 rounded-2xl rounded-tl-none inline-block min-w-[200px]">
                                        <div className="font-bold text-sm flex items-center mb-1">
                                            <Link to={`/user/${c.userId}`} className="hover:text-primary mr-1">
                                                {c.username}
                                            </Link>
                                            <RoleBadge roles={c.roles || [Role.USER]}/>
                                        </div>
                                        <div className="text-slate-700 dark:text-slate-200 text-sm whitespace-pre-wrap">{c.content}</div>
                                    </div>
                                    <div className="flex items-center gap-4 mt-1 ml-2 text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500 font-medium">
                                        <span>{formatDate(c.createdAt)}</span>
                                        <button onClick={() => handleLikeComment(c.id)} className={`flex items-center gap-1 hover:text-primary ${isLiked ? 'text-primary':''}`}>
                                            <ThumbsUp className={`w-3 h-3 ${isLiked ? 'fill-current':''}`}/> {likesCount > 0 ? likesCount : 'Thích'}
                                        </button>
                                        <button 
                                            onClick={() => {
                                                setReplyingTo(replyingTo === c.id ? null : c.id);
                                                setReplyContent('');
                                            }} 
                                            className="hover:text-primary"
                                        >
                                            Trả lời
                                        </button>
                                    </div>

                                    {replyingTo === c.id && (
                                        <div className="mt-4 flex gap-2">
                                            <input 
                                                autoFocus
                                                value={replyContent} 
                                                onChange={e=>setReplyContent(e.target.value)}
                                                className="flex-1 border border-purple-100 dark:border-purple-900/50 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white/50 dark:bg-[#1a1b26]/50 shadow-inner"
                                                placeholder={`Trả lời ${c.username}...`}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') handleReplySubmit(c.id);
                                                }}
                                            />
                                            <button onClick={() => handleReplySubmit(c.id)} className="text-white bg-primary p-2 hover:bg-purple-600 rounded-full shadow-md shadow-primary/20 transition-colors"><Send className="w-4 h-4"/></button>
                                        </div>
                                    )}

                                    {c.replies && c.replies.length > 0 && (
                                        <div className="mt-3 pl-4 border-l-2 border-slate-100 space-y-3">
                                            {c.replies.map(r => (
                                                <div key={r.id} className="flex gap-3">
                                                    <Link to={`/user/${r.userId}`}>
                                                        <img src={r.userAvatar} className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-800 flex-shrink-0 hover:border-primary transition-all" alt=""/>
                                                    </Link>
                                                    <div className="flex-1">
                                                        <div className="bg-white/60 dark:bg-[#1a1b26]/60 shadow-sm border border-purple-50/50 p-3 rounded-2xl rounded-tl-none inline-block">
                                                            <div className="font-bold text-xs flex items-center">
                                                                <Link to={`/user/${r.userId}`} className="hover:text-primary mr-1">
                                                                    {r.username}
                                                                </Link>
                                                                <RoleBadge roles={r.roles || [Role.USER]}/>
                                                            </div>
                                                            <div className="text-slate-700 dark:text-slate-200 text-sm whitespace-pre-wrap">{r.content}</div>
                                                        </div>
                                                        <div className="flex items-center gap-3 ml-1 mt-0.5 text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                                                            <span>{formatDate(r.createdAt)}</span>
                                                            <button 
                                                                onClick={() => handleReplyToSubComment(c.id, r.username)}
                                                                className="hover:text-primary transition-colors"
                                                            >
                                                                Trả lời
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* PIN DURATION MODAL */}
            {isPinModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
                    <div className="bg-white dark:bg-[#1a1b26] rounded-xl shadow-2xl max-w-sm w-full animate-scaleIn">
                        <div className="p-6 text-center">
                            <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Pin className="w-7 h-7"/>
                            </div>
                            <h3 className="text-lg font-bold mb-2">Ghim bài viết</h3>
                            <p className="text-slate-500 dark:text-slate-400 dark:text-slate-500 mb-6 text-sm">Chọn thời gian bạn muốn ghim bài viết này lên đầu diễn đàn.</p>
                            
                            <div className="grid grid-cols-1 gap-2">
                                <button onClick={() => handlePinPost(1)} className="w-full py-3 border rounded-lg hover:bg-slate-50 dark:bg-[#0f1016] hover:border-blue-300 font-medium flex items-center justify-center">
                                    <Clock className="w-4 h-4 mr-2 text-slate-400 dark:text-slate-500"/> 24 Giờ
                                </button>
                                <button onClick={() => handlePinPost(7)} className="w-full py-3 border rounded-lg hover:bg-slate-50 dark:bg-[#0f1016] hover:border-blue-300 font-medium flex items-center justify-center">
                                    <Calendar className="w-4 h-4 mr-2 text-slate-400 dark:text-slate-500"/> 1 Tuần (7 ngày)
                                </button>
                                <button onClick={() => handlePinPost(30)} className="w-full py-3 border rounded-lg hover:bg-slate-50 dark:bg-[#0f1016] hover:border-blue-300 font-medium flex items-center justify-center">
                                    <Calendar className="w-4 h-4 mr-2 text-slate-400 dark:text-slate-500"/> 1 Tháng (30 ngày)
                                </button>
                                <button onClick={() => handlePinPost(null)} className="w-full py-3 border border-red-200 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 font-bold flex items-center justify-center">
                                    <Pin className="w-4 h-4 mr-2 fill-current"/> Vĩnh viễn
                                </button>
                            </div>

                            <button onClick={() => setIsPinModalOpen(false)} className="mt-4 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:text-slate-300 text-sm font-medium">
                                Hủy bỏ
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* EDIT POST MODAL */}
            {isEditModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
                    <div className="bg-white dark:bg-[#1a1b26] rounded-xl shadow-2xl max-w-2xl w-full animate-scaleIn">
                        <div className="flex justify-between items-center p-6 border-b">
                            <h3 className="font-bold text-xl flex items-center"><Edit className="w-5 h-5 mr-2"/> Chỉnh sửa bài viết</h3>
                            <button onClick={()=>setIsEditModalOpen(false)} className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:text-slate-300"><X className="w-6 h-6"/></button>
                        </div>
                        <form onSubmit={handleUpdatePost} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Tiêu đề</label>
                                <input 
                                    value={editForm.title}
                                    onChange={e => setEditForm({...editForm, title: e.target.value})}
                                    className="w-full border p-2 rounded focus:ring-2 focus:ring-primary/50 outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Chủ đề</label>
                                <select 
                                    value={editForm.topic}
                                    onChange={e => setEditForm({...editForm, topic: e.target.value as ForumTopic})}
                                    className="w-full border p-2 rounded focus:ring-2 focus:ring-primary/50 outline-none"
                                >
                                    {Object.values(ForumTopic).map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Nội dung</label>
                                <textarea 
                                    value={editForm.content}
                                    onChange={e => setEditForm({...editForm, content: e.target.value})}
                                    className="w-full border p-2 rounded h-40 focus:ring-2 focus:ring-primary/50 outline-none"
                                    required
                                />
                            </div>
                            <div className="flex justify-end pt-4 space-x-3">
                                <button type="button" onClick={()=>setIsEditModalOpen(false)} className="px-5 py-2 border rounded font-medium hover:bg-slate-50 dark:bg-[#0f1016]">Hủy</button>
                                <button 
                                    type="submit" 
                                    disabled={updating}
                                    className="bg-primary hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-bold flex items-center"
                                >
                                    {updating ? <Loader2 className="animate-spin w-5 h-5 mr-2"/> : <Save className="w-5 h-5 mr-2"/>} Lưu thay đổi
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
