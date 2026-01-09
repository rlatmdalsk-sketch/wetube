import { api } from "./axios";

// 구독 토글
export const toggleSubscription = async (channelId: number) => {
    const response = await api.post<{ isSubscribed: boolean }>(`/subscriptions/${channelId}`);
    return response.data;
};
