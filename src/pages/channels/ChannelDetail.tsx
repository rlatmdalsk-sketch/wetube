import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { fetchChannel, type ChannelData } from "../../api/channel";
import { toggleSubscription } from "../../api/subscription";
import { useAuthStore } from "../../store/authStore";
import Avatar from "../../components/ui/Avatar";
import VideoCard from "../../components/video/VideoCard";
import { twMerge } from "tailwind-merge";
import { useModalStore } from "../../store/ModalStore.ts";

export default function ChannelDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user: currentUser, isLoggedIn } = useAuthStore();
    const { openModal } = useModalStore();

    const [channel, setChannel] = useState<ChannelData | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("videos"); // 탭 상태

    // 데이터 로드
    useEffect(() => {
        if (id) loadChannel(Number(id));
    }, [id]);

    const loadChannel = async (channelId: number) => {
        try {
            const data = await fetchChannel(channelId);
            setChannel(data);
        } catch (error) {
            console.error("채널 로드 실패", error);
        } finally {
            setLoading(false);
        }
    };

    // 구독 핸들러 (본인 채널이 아닐 때)
    const handleSubscribe = async () => {
        if (!channel) return;
        if (!isLoggedIn) return openModal("LOGIN_REQUIRED");

        const prev = channel.isSubscribed;
        // Optimistic UI Update
        setChannel({ ...channel, isSubscribed: !prev });

        try {
            const result = await toggleSubscription(channel.id);
            setChannel(prev => (prev ? { ...prev, isSubscribed: result.isSubscribed } : null));
        } catch (error) {
            setChannel({ ...channel, isSubscribed: prev }); // 롤백
        }
    };

    if (loading) return <div className="text-center pt-20">로딩 중...</div>;
    if (!channel) return <div className="text-center pt-20">채널을 찾을 수 없습니다.</div>;

    const isMyChannel = currentUser?.id === channel.id;

    return (
        <div className="w-full min-h-screen pb-10">
            {/* 2. 채널 헤더 정보 */}
            <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 mt-6 mb-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                    {/* 프로필 이미지 (XL 사이즈) */}
                    <Avatar
                        src={channel.profileImage}
                        nickname={channel.nickname}
                        size="xl"
                        className="text-4xl"
                    />

                    <div className="flex-1 flex flex-col gap-2">
                        <h1 className="text-2xl sm:text-3xl font-bold text-text-default">
                            {channel.nickname}
                        </h1>
                        <div className="text-sm text-text-disabled flex flex-col gap-1">
                            <p>@{channel.email.split("@")[0]}</p>
                            <p>
                                구독자 {channel.subscriberCount}명 • 동영상 {channel.videoCount}개
                            </p>
                            {/* 나중에 description(소개글) 필드가 추가되면 여기에 표시 */}
                        </div>

                        {/* 버튼 영역: 내 채널이면 '채널 맞춤설정', 남이면 '구독' */}
                        <div className="mt-2">
                            {isMyChannel ? (
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => navigate("/users/edit")}
                                        className="px-4 py-2 bg-background-paper border border-divider rounded-full text-sm font-semibold hover:bg-background-default transition-colors">
                                        프로필 수정
                                    </button>
                                    <button
                                        onClick={() => navigate("/videos/upload")}
                                        className="px-4 py-2 bg-background-paper border border-divider rounded-full text-sm font-semibold hover:bg-background-default transition-colors">
                                        동영상 관리
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={handleSubscribe}
                                    className={twMerge(
                                        "px-6 py-2 rounded-full text-sm font-medium transition-colors",
                                        channel.isSubscribed
                                            ? "bg-background-paper text-text-default border border-divider hover:bg-background-default"
                                            : "bg-text-default text-background-default hover:opacity-90",
                                    )}>
                                    {channel.isSubscribed ? "구독중" : "구독"}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. 탭 메뉴 (Sticky) */}
            <div className="sticky top-14 bg-background-default z-10 border-b border-divider mb-6">
                <div className="max-w-[1280px] mx-auto px-4 flex gap-6 overflow-x-auto">
                    {["홈", "동영상", "재생목록", "커뮤니티"].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab === "동영상" ? "videos" : "home")}
                            className={twMerge(
                                "py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap",
                                (tab === "동영상" && activeTab === "videos") ||
                                    (tab === "홈" && activeTab === "home")
                                    ? "border-text-default text-text-default"
                                    : "border-transparent text-text-disabled hover:text-text-default",
                            )}>
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* 4. 콘텐츠 영역 */}
            <div className="max-w-400 mx-auto px-4 sm:px-6">
                <h2 className="text-lg font-bold mb-4">동영상</h2>
                {channel.videos.length > 0 ? (
                    <div className="flex flex-wrap -mx-2">
                        {channel.videos.map(video => (
                            <div
                                key={video.id}
                                className={twMerge([
                                    "w-full",
                                    "sm:w-1/2",
                                    "lg:w-1/3",
                                    "xl:w-1/4",
                                    "px-2",
                                    "mb-8",
                                ])}>
                                <VideoCard video={video} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 text-text-disabled">
                        업로드한 동영상이 없습니다.
                    </div>
                )}
            </div>
        </div>
    );
}
