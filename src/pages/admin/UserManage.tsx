import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { fetchAllUsers, type UserData } from "../../api/admin";
import Avatar from "../../components/ui/Avatar.tsx";
import Pagination from "../../components/ui/Pagination.tsx";

export default function UserManage() {
    const [users, setUsers] = useState<UserData[]>([]);
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
            const data = await fetchAllUsers(pageNum);
            setUsers(data.users);
            setTotalPages(data.totalPages);
            setTotal(data.total);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-800">회원 목록</h3>
                <span className="text-sm text-gray-500">총 {total}명 (현재 페이지:{page})</span>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-50 text-gray-500 uppercase font-medium border-b border-gray-200">
                    <tr>
                        <th className="px-6 py-4">사용자</th>
                        <th className="px-6 py-4">이메일</th>
                        <th className="px-6 py-4 text-center">권한</th>
                        <th className="px-6 py-4 text-center">활동 (영상/댓글)</th>
                        <th className="px-6 py-4 text-center">가입일</th>
                        <th className="px-6 py-4 text-center">관리</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                    {loading ? (
                        <tr><td colSpan={6} className="p-8 text-center">로딩 중...</td></tr>
                    ) : users.map(user => (
                        <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <Avatar src={user.profileImage} nickname={user.nickname} size="sm" />
                                    <span className="font-semibold text-gray-800">{user.nickname}</span>
                                </div>
                            </td>
                            <td className="px-6 py-4">{user.email}</td>
                            <td className="px-6 py-4 text-center">
                                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-bold ${
                                        user.role === "ADMIN"
                                            ? "bg-purple-100 text-purple-700"
                                            : "bg-green-100 text-green-700"
                                    }`}>
                                        {user.role}
                                    </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                                {user._count.videos} / {user._count.comments}
                            </td>
                            <td className="px-6 py-4 text-center">
                                {dayjs(user.createdAt).format("YYYY-MM-DD")}
                            </td>
                            <td className="px-6 py-4 text-center">
                                <button className="text-blue-600 hover:text-blue-800 font-medium text-xs border border-blue-200 px-3 py-1 rounded bg-blue-50 hover:bg-blue-100 transition-colors">
                                    수정
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            <div className="p-4 border-t border-gray-200">
                <Pagination currentPage={page} totalPage={totalPages} onPageChange={setPage} />
            </div>
        </div>
    );
}