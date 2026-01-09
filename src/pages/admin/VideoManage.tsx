import { useEffect, useState } from "react";
import { Link } from "react-router";
import { fetchAdminVideos, deleteAdminVideo, type AdminVideoData } from "../../api/admin";
import Pagination from "../../components/ui/Pagination";
import dayjs from "dayjs";
import { MdDelete, MdOpenInNew, MdPlayArrow } from "react-icons/md";

export default function VideoManage() {
    const [videos, setVideos] = useState<AdminVideoData[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        loadData(page);
    }, [page]);

    const loadData = async (pageNum: number) => {
        setLoading(true);
        try {
            const data = await fetchAdminVideos(pageNum);
            setVideos(data.videos);
            setTotalPages(data.totalPages);
            setTotal(data.total);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number, title: string) => {
        if (
            !window.confirm(
                `'${title}' 영상을 정말 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`,
            )
        )
            return;
        try {
            await deleteAdminVideo(id);
            alert("삭제되었습니다.");
            loadData(page); // 목록 갱신
        } catch (error) {
            console.error(error);
            alert("삭제 실패");
        }
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-800">동영상 관리</h3>
                <span className="text-sm text-gray-500">
                    총 {total}개 (현재 페이지:{page})
                </span>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-50 text-gray-500 uppercase font-medium border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4 w-[40%]">영상 정보</th>
                            <th className="px-6 py-4">작성자</th>
                            <th className="px-6 py-4 text-center">조회수/좋아요</th>
                            <th className="px-6 py-4 text-center">업로드일</th>
                            <th className="px-6 py-4 text-center">관리</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="p-8 text-center">
                                    로딩 중...
                                </td>
                            </tr>
                        ) : (
                            videos.map(video => (
                                <tr key={video.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex gap-3">
                                            {/* 썸네일 */}
                                            <div className="w-24 h-14 bg-gray-200 rounded overflow-hidden flex-shrink-0 relative group">
                                                {video.thumbnailPath ? (
                                                    <img
                                                        src={video.thumbnailPath}
                                                        alt="thumb"
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-slate-300">
                                                        <MdPlayArrow className="text-white" />
                                                    </div>
                                                )}
                                            </div>
                                            {/* 제목 및 설명 */}
                                            <div className="min-w-0">
                                                <Link
                                                    to={`/videos/${video.id}`}
                                                    target="_blank" // 새 탭에서 확인
                                                    className="font-semibold text-gray-800 hover:text-blue-600 truncate flex items-center gap-1">
                                                    {video.title}{" "}
                                                    <MdOpenInNew className="text-gray-400 text-xs" />
                                                </Link>
                                                <p className="text-xs text-gray-500 line-clamp-1">
                                                    {video.description || "설명 없음"}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-gray-800">
                                                {video.author.nickname}
                                            </span>
                                            <span className="text-xs text-gray-400">
                                                {video.author.email}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="text-xs">
                                            <span className="font-bold text-gray-700">
                                                {video.views.toLocaleString()}
                                            </span>{" "}
                                            views
                                            <br />
                                            <span className="text-red-500">
                                                ♥ {video._count.likes}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {dayjs(video.createdAt).format("YYYY-MM-DD")}
                                        <br />
                                        <span className="text-xs text-gray-400">
                                            {dayjs(video.createdAt).format("HH:mm")}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button
                                            onClick={() => handleDelete(video.id, video.title)}
                                            className="text-red-600 hover:text-red-800 font-medium text-xs border border-red-200 px-3 py-1 rounded bg-red-50 hover:bg-red-100 transition-colors flex items-center gap-1 mx-auto">
                                            <MdDelete /> 삭제
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="p-4 border-t border-gray-200">
                <Pagination currentPage={page} totalPage={totalPages} onPageChange={setPage} />
            </div>
        </div>
    );
}
