import api from "./axios.ts";

export interface Video {
    id: number;
    createdAt: string;

    title: string;
    description: string;
    videoPath: string;
    thumbnailPath: string;
    views: number;
    likeCount: number;
    isLiked?: boolean;
    isSubscribed?: boolean; // ✨ 추가
    subscriberCount?: number; // ✨ 추가
    author: {
        id: number;
        nickname: string;
        profileImage: string;
    };
}

// 전체 목록 조회
export const fetchVideos = async (page = 1, limit = 24) => {
    const response = await api.get<{
        videos: Video[];
        total: number;
        totalPages: number;
        hasNextPage: boolean;
    }>("/videos", {
        params: { page, limit },
    });
    return response.data;
};

// 상세 조회
export const fetchVideoDetail = async (id: number) => {
    const response = await api.get<Video>(`/videos/${id}`);
    return response.data;
};

// ✨ 좋아요 토글 API
export const toggleVideoLike = async (videoId: number) => {
    // 결과로 { isLiked: true/false } 가 옴
    const response = await api.post<{ isLiked: boolean }>(`/videos/${videoId}/like`);
    return response.data;
};

// ✨ 시청 기록 가져오기
export const fetchVideoHistory = async () => {
    const response = await api.get<Video[]>("/videos/history");
    return response.data;
};

export const fetchLikedVideos = async () => {
    const response = await api.get<Video[]>("/videos/liked");
    return response.data;
};

export const fetchSubscribedVideos = async () => {
    const response = await api.get<Video[]>("/videos/subscribed");
    return response.data;
};

export const searchVideos = async (query: string) => {
    // 쿼리 파라미터로 전달 (?q=검색어)
    const response = await api.get<Video[]>(`/videos/search`, {
        params: { q: query },
    });
    return response.data;
};