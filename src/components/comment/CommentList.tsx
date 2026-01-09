import { useEffect, useState, type FormEvent } from "react";
import { fetchComments, createComment, deleteComment, type Comment } from "../../api/comment";
import { useAuthStore } from "../../store/authStore";
import { useModalStore } from "../../store/ModalStore.ts";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/ko";
import Avatar from "../ui/Avatar.tsx";

dayjs.extend(relativeTime);
dayjs.locale("ko");

interface CommentListProps {
    videoId: number;
}

export default function CommentList({ videoId }: CommentListProps) {
    const { user, isLoggedIn } = useAuthStore();
    const { openModal } = useModalStore();

    const [comments, setComments] = useState<Comment[]>([]);
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(true);

    // 댓글 불러오기
    useEffect(() => {
        loadComments(videoId).then(() => {});
    }, [videoId]);

    const loadComments = async (id: number) => {
        try {
            const data = await fetchComments(id);
            setComments(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // 댓글 등록
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!isLoggedIn) return openModal("LOGIN_REQUIRED");
        if (!content.trim()) return;

        try {
            const newComment = await createComment(videoId, content);
            setComments([newComment, ...comments]); // 최신 댓글을 맨 앞에 추가
            setContent(""); // 입력창 초기화
        } catch (error) {
            console.log(error);
            alert("댓글 등록에 실패했습니다.");
        }
    };

    // 댓글 삭제
    const handleDelete = async (commentId: number) => {
        if (!window.confirm("댓글을 삭제하시겠습니까?")) return;
        try {
            await deleteComment(commentId);
            setComments(comments.filter(c => c.id !== commentId));
        } catch (error) {
            console.log(error);
            alert("삭제 실패");
        }
    };

    if (loading) return null;

    return (
        <div className="mt-6">
            <h3 className="text-lg font-bold text-text-default mb-4">댓글 {comments.length}개</h3>

            {/* 댓글 입력 폼 */}
            {user && (
                <form onSubmit={handleSubmit} className="flex gap-4 mb-8">
                    <Avatar nickname={user?.nickname || "?"} src={user?.profileImage} size={"md"} />
                    <div className="flex-1">
                        <input
                            type="text"
                            placeholder="댓글 추가..."
                            value={content}
                            onChange={e => setContent(e.target.value)}
                            onFocus={() => {
                                if (!isLoggedIn) openModal("LOGIN_REQUIRED");
                            }}
                            className="w-full bg-transparent border-b border-divider pb-1 text-text-default focus:border-text-default focus:outline-none transition-colors"
                        />
                        <div className="flex justify-end mt-2">
                            <button
                                type="submit"
                                disabled={!content.trim()}
                                className="px-4 py-2 bg-text-default text-background-default rounded-full text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90">
                                댓글 달기
                            </button>
                        </div>
                    </div>
                </form>
            )}

            {/* 댓글 리스트 */}
            <div className="space-y-6">
                {comments.map(comment => (
                    <div key={comment.id} className="flex gap-4 group">
                        <Avatar
                            src={comment.author.profileImage}
                            nickname={comment.author.nickname}
                            size="md"
                        />
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-bold text-text-default">
                                    {comment.author.nickname}
                                </span>
                                <span className="text-xs text-text-disabled">
                                    {dayjs(comment.createdAt).fromNow()}
                                </span>
                            </div>
                            <p className="text-sm text-text-default whitespace-pre-wrap">
                                {comment.content}
                            </p>
                        </div>
                        {/* 삭제 버튼 (작성자 본인일 때만) */}
                        {user?.id === comment.author.id && (
                            <button
                                onClick={() => handleDelete(comment.id)}
                                className="text-xs text-text-disabled hover:text-error-main opacity-0 group-hover:opacity-100 transition-opacity">
                                삭제
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
