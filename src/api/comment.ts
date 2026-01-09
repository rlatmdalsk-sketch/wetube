import { api } from "./axios";

export interface Comment {
    id: number;
    content: string;
    createdAt: string;
    author: {
        id: number;
        nickname: string;
        profileImage: string | null;
    };
}

// 목록 조회
export const fetchComments = async (videoId: number) => {
    const response = await api.get<Comment[]>(`/videos/${videoId}/comments`);
    return response.data;
};

// 댓글 등록
export const createComment = async (videoId: number, content: string) => {
    const response = await api.post<Comment>(`/videos/${videoId}/comments`, { content });
    return response.data;
};

// 댓글 삭제
export const deleteComment = async (commentId: number) => {
    const response = await api.delete(`/comments/${commentId}`);
    return response.data;
};
