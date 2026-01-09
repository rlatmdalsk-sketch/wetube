import { api } from "./axios";
import type { Video } from "./video";

export interface ChannelData {
    id: number;
    email: string;
    nickname: string;
    profileImage: string | null;
    subscriberCount: number;
    videoCount: number;
    isSubscribed: boolean;
    videos: Video[];
}

export const fetchChannel = async (channelId: number) => {
    const response = await api.get<ChannelData>(`/channels/${channelId}`);
    return response.data;
};
