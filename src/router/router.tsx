import { createBrowserRouter } from "react-router";
import Layout from "../layouts/Layout.tsx";
import SignUp from "../pages/SignUp.tsx";
import SignIn from "../pages/SignIn.tsx";
import VideoUpload from "../pages/videos/VideoUpload.tsx";
import ProfileEdit from "../pages/users/ProfileEdit.tsx";
import NoticeList from "../pages/notices/NoticeList.tsx";
import NoticeDetail from "../pages/notices/NoticeDetail.tsx";
import NoticeCreate from "../pages/notices/NoticeCreate.tsx";
import NoticeEdit from "../pages/notices/NoticeEdit.tsx";
import InquiryList from "../pages/inquiries/InquiryList.tsx";
import InquiryCreate from "../pages/inquiries/InpuiryCreate.tsx";
import InquiryDetail from "../pages/inquiries/InquiryDetail.tsx";
import Home from "../pages/Home.tsx";
import VideoDetail from "../pages/videos/VideoDetail.tsx";
import VideoHistory from "../pages/videos/VideoHistory.tsx";
import ChannelDetail from "../pages/channels/ChannelDetail.tsx";
import LikedVideos from "../pages/playlist/liked.tsx";
import Subscriptions from "../pages/channels/Subscriptions.tsx";
import SearchResults from "../pages/videos/SearchResults.tsx";
import InquiryEdit from "../pages/inquiries/InquiryEdit.tsx";
import AdminLayout from "../layouts/AdminLayout.tsx";
import UserManage from "../pages/admin/UserManage.tsx";
import Dashboard from "../pages/admin/Dashboard.tsx";
import VideoManage from "../pages/admin/VideoManage.tsx";

const router = createBrowserRouter([
    {
        path: "/",
        element: <Layout />,
        children: [
            { index: true, element: <Home /> },
            { path: "sign-in", element: <SignIn /> },
            { path: "sign-up", element: <SignUp /> },
            {
                path: "users",
                children: [{ path: "edit", element: <ProfileEdit /> }],
            },
            {
                path: "channels",
                children: [
                    { path: ":id", element: <ChannelDetail /> },
                    { path: "subscriptions", element: <Subscriptions /> },
                ],
            },
            {
                path: "notices",
                children: [
                    { index: true, element: <NoticeList /> },
                    { path: "create", element: <NoticeCreate /> },
                    { path: ":id", element: <NoticeDetail /> },
                    { path: ":id/edit", element: <NoticeEdit /> },
                ],
            },
            {
                path: "inquiries",
                children: [
                    { index: true, element: <InquiryList /> },
                    { path: "new", element: <InquiryCreate /> },
                    { path: ":id", element: <InquiryDetail /> },
                    { path: ":id/edit", element: <InquiryEdit /> },
                ],
            },
            { path: "results", element: <SearchResults /> },
            {
                path: "videos/",
                children: [
                    { path: ":id", element: <VideoDetail /> },
                    { path: "upload", element: <VideoUpload /> },
                    { path: "history", element: <VideoHistory /> }, // ✨ 추가
                ],
            },
            {
                path: "playlist",
                children: [{ path: "liked", element: <LikedVideos /> }],
            },
        ],
    },
    {
        path: "/admin",
        element: <AdminLayout />,
        children: [
            { index: true, element: <Dashboard /> },
            { path: "users", element: <UserManage /> },
            { path: "videos", element: <VideoManage /> },
        ],
    },
]);

export default router;
