import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { fetchMyInquiries, type Inquiry } from "../../api/inquiry";
import Button from "../../components/ui/Button";
import dayjs from "dayjs";
import Pagination from "../../components/ui/Pagination.tsx";

export default function InquiryList() {
    const navigate = useNavigate();
    const [inquiries, setInquiries] = useState<Inquiry[]>([]);
    const [loading, setLoading] = useState(true);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPage, setTotalPage] = useState(1);
    const LIMIT = 10; // 한 페이지당 개수

    useEffect(() => {
        loadData(currentPage).then(() => {});
    }, [currentPage]);

    const loadData = async (page: number) => {
        try {
            const data = await fetchMyInquiries(page, LIMIT);
            setInquiries(data.inquiries);
            setTotalPage(data.totalPages);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
        window.scrollTo(0, 0);
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-10">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-text-default">1:1 문의</h1>
                <Button onClick={() => navigate("/inquiries/new")}>문의하기</Button>
            </div>

            {/* 테이블 래퍼: 둥근 모서리와 테두리 유지를 위해 필요 */}
            <div className="bg-background-paper border border-divider rounded-lg overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-background-default border-b border-divider">
                        <tr>
                            <th className="px-6 py-3 text-sm font-medium text-text-disabled text-center w-[10%] min-w-[80px]">
                                상태
                            </th>
                            <th className="px-6 py-3 text-sm font-medium text-text-disabled w-[70%]">
                                제목
                            </th>
                            <th className="px-6 py-3 text-sm font-medium text-text-disabled text-center w-[20%] min-w-[100px]">
                                날짜
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-divider">
                        {loading ? (
                            <tr>
                                <td colSpan={3} className="p-8 text-center text-text-disabled">
                                    로딩 중...
                                </td>
                            </tr>
                        ) : inquiries.length === 0 ? (
                            <tr>
                                <td colSpan={3} className="p-8 text-center text-text-disabled">
                                    문의 내역이 없습니다.
                                </td>
                            </tr>
                        ) : (
                            inquiries.map(inquiry => (
                                <tr
                                    key={inquiry.id}
                                    className="hover:bg-background-default/50 transition-colors">
                                    <td className="px-6 py-4 text-center align-middle">
                                        <span
                                            className={`inline-block text-xs px-2 py-1 rounded-full whitespace-nowrap ${
                                                inquiry.isAnswered
                                                    ? "bg-success-main/10 text-success-main"
                                                    : "bg-text-disabled/10 text-text-disabled"
                                            }`}>
                                            {inquiry.isAnswered ? "답변완료" : "대기중"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 align-middle">
                                        <Link
                                            to={`/inquiries/${inquiry.id}`}
                                            className="text-text-default hover:text-primary-main font-medium transition-colors line-clamp-1 block">
                                            {inquiry.title}
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4 text-center text-text-disabled text-sm align-middle whitespace-nowrap">
                                        {dayjs(inquiry.createdAt).format("YYYY.MM.DD")}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* ✨ 페이지네이션 컴포넌트 사용 */}
            {!loading && inquiries.length > 0 && (
                <Pagination
                    currentPage={currentPage}
                    totalPage={totalPage}
                    onPageChange={handlePageChange}
                />
            )}
        </div>
    );
}
