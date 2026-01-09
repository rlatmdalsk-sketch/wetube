import { api } from "./axios";

export interface Notice {
    id: number;
    title: string;
    content: string;
    viewCount: number;
    createdAt: string;
    updatedAt: string;
}

interface NoticeListResponse {
    notices: Notice[];
    total: number;
    page: number;
    totalPages: number;
}

export const fetchNotices = async (page = 1, limit = 10) => {
    const response = await api.get<NoticeListResponse>(`/notices?page=${page}&limit=${limit}`);
    return response.data;
};

export const fetchNoticeDetail = async (id: number) => {
    const response = await api.get<Notice>(`/notices/${id}`);
    return response.data;
};

// ✨ 공지사항 수정 호출 함수 추가
export const updateNotice = async (id: number, data: { title: string; content: string }) => {
    const response = await api.patch(`/notices/${id}`, data);
    return response.data;
};

// ✨ 공지사항 삭제 함수 추가
export const deleteNotice = async (id: number) => {
    const response = await api.delete(`/notices/${id}`);
    return response.data;
};