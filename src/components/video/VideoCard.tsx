import type { Video } from "../../api/video.ts";
import { Link } from "react-router";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/ko";
import Avatar from "../ui/Avatar.tsx";

dayjs.extend(relativeTime);
dayjs.locale("ko");

interface VideoCardProps {
    video: Video;
}

export default function VideoCard({ video }: VideoCardProps) {
    return (
        <Link to={`/videos/${video.id}`} className="group flex flex-col gap-3 cursor-pointer">
            {/* 1. 썸네일 영역 */}
            <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-100">
                <img
                    src={video.thumbnailPath}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
            </div>

            {/* 2. 정보 영역 */}
            <div className="flex gap-3">
                {/* 작성자 프로필 이미지 */}
                <Avatar
                    nickname={video.author.nickname}
                    src={video.author.profileImage}
                    size={"sm"}
                />

                {/* 텍스트 정보 */}
                <div className="flex flex-col">
                    <h3 className="text-base font-semibold text-text-default line-clamp-2 leading-tight group-hover:text-text-default">
                        {video.title}
                    </h3>
                    <div className="text-sm text-text-disabled mt-1">
                        <p className="hover:text-text-default transition-colors">
                            {video.author.nickname}
                        </p>
                        <p>
                            조회수 {video.views}회 • {dayjs(video.createdAt).fromNow()}
                        </p>
                    </div>
                </div>
            </div>
        </Link>
    );
}
