import axios from "axios";
import { useAuthStore } from "../store/authStore.ts";

const BASE_URL = import.meta.env.VITE_BASE_URL;
const API_KEY = import.meta.env.VITE_API_KEY;

export const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        "Content-Type": "application/json",
        "x-client-key": API_KEY, // 백엔드 미들웨어 통과용 키
    },
});

// 요청 인터셉터: 로컬 스토리지에 토큰이 있다면 헤더에 자동 추가
api.interceptors.request.use(config => {
    const token = useAuthStore.getState().token;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
