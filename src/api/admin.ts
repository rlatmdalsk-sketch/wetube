import { api } from "./axios";
import type { Video } from "./video.ts";

export interface UserData {
    id: number;
    email: string;
    nickname: string;
    role: "USER" | "ADMIN";
    profileImage: string | null;
    createdAt: string;
    _count: {
        videos: number;
        comments: number;
    };
}

export interface DashboardData {
    stats: {
        totalUsers: number;
        totalVideos: number;
        totalViews: number;
        pendingInquiries: number;
    };
    recentUsers: UserData[];
    recentVideos: Video[];
}

export interface AdminVideoData {
    id: number;
    title: string;
    description: string;
    videoPath: string;
    thumbnailPath: string;
    views: number;
    createdAt: string;
    author: {
        nickname: string;
        email: string;
    };
    _count: {
        likes: number;
        comments: number;
    };
}

export const fetchAllUsers = async (page = 1) => {
    const response = await api.get<{ users: UserData[]; totalPages: number; total: number }>(
        "/admin/users",
        {
            params: { page },
        },
    );
    return response.data;
};

export const fetchDashboardStats = async () => {
    const response = await api.get<DashboardData>("/admin/stats");
    return response.data;
};

export const fetchAdminVideos = async (page = 1) => {
    const response = await api.get<{ videos: AdminVideoData[]; totalPages: number; total: number }>(
        "/admin/videos",
        {
            params: { page },
        },
    );
    return response.data;
};

// 영상 삭제
export const deleteAdminVideo = async (id: number) => {
    await api.delete(`/admin/videos/${id}`);
};
