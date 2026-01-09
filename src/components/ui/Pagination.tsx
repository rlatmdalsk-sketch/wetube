import { MdChevronLeft, MdChevronRight } from "react-icons/md";
import { twMerge } from "tailwind-merge";

interface PaginationProps {
    currentPage: number; // 현재 페이지
    totalPage: number; // 전체 페이지 수
    onPageChange: (page: number) => void; // 페이지 변경 핸들러
    className?: string; // 추가 스타일
}

export default function Pagination({
    currentPage,
    totalPage,
    onPageChange,
    className,
}: PaginationProps) {
    // 페이지 번호 생성 로직 (현재 페이지 기준으로 최대 5개 표시)
    const getPageNumbers = () => {
        const pageNumbers = [];
        const maxPagesToShow = 5;

        // 시작 페이지 계산 (현재 페이지가 중앙에 오도록)
        let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
        let endPage = startPage + maxPagesToShow - 1;

        // 끝 페이지가 전체 페이지를 넘지 않도록 조정
        if (endPage > totalPage) {
            endPage = totalPage;
            // 끝 페이지가 줄어든 만큼 시작 페이지를 앞으로 당김 (단, 1보다 작아지면 안 됨)
            startPage = Math.max(1, endPage - maxPagesToShow + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(i);
        }
        return pageNumbers;
    };

    return (
        <div className={twMerge("flex items-center justify-center gap-2 mt-8", className)}>
            {/* 이전 버튼 */}
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-full text-text-default cursor-pointer hover:bg-background-paper disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                aria-label="Previous Page">
                <MdChevronLeft className="w-6 h-6" />
            </button>

            {/* 페이지 번호들 */}
            {getPageNumbers().map(page => (
                <button
                    key={page}
                    onClick={() => onPageChange(page)}
                    className={twMerge(
                        "w-9 h-9 flex items-center justify-center rounded-full text-sm font-medium transition-all cursor-pointer",
                        currentPage === page
                            ? "bg-text-default text-background-default font-bold scale-105" // 활성 상태
                            : "text-text-default hover:bg-background-paper", // 비활성 상태
                    )}>
                    {page}
                </button>
            ))}

            {/* 다음 버튼 */}
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPage}
                className="p-2 rounded-full text-text-default cursor-pointer hover:bg-background-paper disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                aria-label="Next Page">
                <MdChevronRight className="w-6 h-6" />
            </button>
        </div>
    );
}
