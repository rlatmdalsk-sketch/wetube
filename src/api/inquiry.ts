import { api } from "./axios";

export interface Inquiry {
    id: number;
    title: string;
    content: string;
    answer?: string;
    isAnswered: boolean;
    answeredAt?: string;
    createdAt: string;
    author: {
        id: number;
        nickname: string;
        email: string;
        profileImage?: string;
    };
}

interface InquiryListResponse {
    inquiries: Inquiry[];
    total: number;
    page: number;
    totalPages: number;
}

// 목록 조회
export const fetchMyInquiries = async (page = 1, limit = 10) => {
    // 기존 URL "/" 그대로 사용
    const response = await api.get<InquiryListResponse>(`/inquiries`, {
        params: { page, limit },
    });
    return response.data;
};

// 상세 조회
export const fetchInquiryDetail = async (id: number) => {
    const response = await api.get<Inquiry>(`/inquiries/${id}`);
    return response.data;
};

// 문의 등록
export const createInquiry = async (data: { title: string; content: string }) => {
    const response = await api.post("/inquiries", data);
    return response.data;
};

export const updateInquiry = async (id: number, data: { title: string; content: string }) => {
    const response = await api.patch<Inquiry>(`/inquiries/${id}`, data);
    return response.data;
};

export const deleteInquiry = async (id: number) => {
    const response = await api.delete(`/inquiries/${id}`);
    return response.data;
};

// 답변 등록 (관리자)
export const answerInquiry = async (id: number, answer: string) => {
    const response = await api.patch(`/inquiries/${id}/answer`, { answer });
    return response.data;
};

export const deleteAnswer = async (id: number) => {
    const response = await api.delete(`/inquiries/${id}/answer`);
    return response.data;
};

// 관리자용 목록 조회
export const fetchAllInquiries = async (page = 1, limit = 10) => {
    const response = await api.get<InquiryListResponse>(`/inquiries/all`, {
        params: { page, limit },
    });
    return response.data;
};
