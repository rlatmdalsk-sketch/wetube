import { useEffect, useState } from "react";
import { fetchDashboardStats, type DashboardData } from "../../api/admin";
import { MdPeople, MdVideoLibrary, MdVisibility, MdLiveHelp } from "react-icons/md";
import Avatar from "../../components/ui/Avatar";
import dayjs from "dayjs";
import { Link } from "react-router";

export default function Dashboard() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const result = await fetchDashboardStats();
                setData(result);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    if (loading) return <div className="p-8 text-center text-gray-500">대시보드 로딩 중...</div>;
    if (!data) return null;

    // 통계 카드 데이터 배열
    const stats = [
        {
            label: "총 회원수",
            value: data.stats.totalUsers.toLocaleString(),
            icon: MdPeople,
            color: "bg-blue-500",
            sub: "명"
        },
        {
            label: "총 동영상",
            value: data.stats.totalVideos.toLocaleString(),
            icon: MdVideoLibrary,
            color: "bg-indigo-500",
            sub: "개"
        },
        {
            label: "누적 조회수",
            value: data.stats.totalViews.toLocaleString(),
            icon: MdVisibility,
            color: "bg-emerald-500",
            sub: "회"
        },
        {
            label: "답변 대기 문의",
            value: data.stats.pendingInquiries,
            icon: MdLiveHelp,
            color: "bg-orange-500",
            sub: "건",
            highlight: data.stats.pendingInquiries > 0 // 값이 있으면 강조
        },
    ];

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">대시보드</h1>

            {/* 1. 상단 통계 카드 영역 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <div key={stat.label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center justify-between hover:shadow-md transition-shadow">
                        <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">{stat.label}</p>
                            <h3 className={`text-2xl font-bold ${stat.highlight ? 'text-orange-600' : 'text-gray-800'}`}>
                                {stat.value} <span className="text-sm font-normal text-gray-400">{stat.sub}</span>
                            </h3>
                        </div>
                        <div className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center text-white shadow-lg shadow-gray-200`}>
                            <stat.icon className="w-6 h-6" />
                        </div>
                    </div>
                ))}
            </div>

            {/* 2. 하단 리스트 영역 (2열 배치) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* 최근 가입 회원 */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="font-bold text-gray-800">최근 가입 회원</h3>
                        <Link to="/admin/users" className="text-xs text-blue-600 hover:underline">전체보기</Link>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {data.recentUsers.map(user => (
                            <div key={user.id} className="p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors">
                                <Avatar src={user.profileImage} nickname={user.nickname} size="sm" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-800 truncate">{user.nickname}</p>
                                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                </div>
                                <span className="text-xs text-gray-400">
                                    {dayjs(user.createdAt).format("MM.DD")}
                                </span>
                            </div>
                        ))}
                        {data.recentUsers.length === 0 && <div className="p-6 text-center text-gray-400 text-sm">데이터가 없습니다.</div>}
                    </div>
                </div>

                {/* 최근 업로드 영상 */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="font-bold text-gray-800">최근 업로드 영상</h3>
                        <span className="text-xs text-gray-400">최신 5건</span>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {data.recentVideos.map(video => (
                            <div key={video.id} className="p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors">
                                <div className="w-16 h-10 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                                    {video.thumbnailPath ? (
                                        <img src={video.thumbnailPath} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-300 text-xs text-gray-500">No Img</div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-800 truncate">{video.title}</p>
                                    <p className="text-xs text-gray-500 truncate">{video.author?.nickname}</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs font-bold text-gray-600">{video.views}</span>
                                    <p className="text-[10px] text-gray-400">Views</p>
                                </div>
                            </div>
                        ))}
                        {data.recentVideos.length === 0 && <div className="p-6 text-center text-gray-400 text-sm">데이터가 없습니다.</div>}
                    </div>
                </div>

            </div>
        </div>
    );
}