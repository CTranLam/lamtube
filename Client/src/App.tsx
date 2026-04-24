import { Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout.tsx";
import AdminLayout from "./layouts/AdminLayout.tsx";
import Home from "./pages/Home.tsx";
import Watch from "./pages/Watch.tsx";
import Login from "./pages/Login.tsx";
import Register from "./pages/Register.tsx";
import ForgotPassword from "./pages/ForgotPassword.tsx";
import VerifyResetOtp from "./pages/VerifyResetOtp.tsx";
import ResetPassword from "./pages/ResetPassword.tsx";
import Channel from "./pages/Channel";
import UploadVideo from "./pages/UploadVideo.tsx";
import Settings from "./pages/Settings.tsx";
import Help from "./pages/Help.tsx";
import Feedback from "./pages/Feedback.tsx";
import Subscriptions from "./pages/Subscriptions.tsx";
import History from "./pages/History.tsx";
import Liked from "./pages/Liked.tsx";
import WatchLater from "./pages/WatchLater.tsx";
import Playlists from "./pages/Playlists.tsx";
import PlaylistDetail from "./pages/PlaylistDetail.tsx";
import AdminDashboard from "./pages/admin/AdminDashboard.tsx";
import UserManagement from "./pages/admin/UserManagement.tsx";
import CategoryManagement from "./pages/admin/CategoryManagement.tsx";
import VideoManagement from "./pages/admin/VideoManagement.tsx";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/forgot-password/verify-otp" element={<VerifyResetOtp />} />
      <Route path="/forgot-password/reset" element={<ResetPassword />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="categories" element={<CategoryManagement />} />
        <Route path="videos" element={<VideoManagement />} />
      </Route>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="channel" element={<Channel />} />
        <Route path="upload" element={<UploadVideo />} />
        <Route path="settings" element={<Settings />} />
        <Route path="help" element={<Help />} />
        <Route path="feedback" element={<Feedback />} />
        <Route path="subscriptions" element={<Subscriptions />} />
        <Route path="playlists" element={<Playlists />} />
        <Route path="playlists/:playlistId" element={<PlaylistDetail />} />
        <Route path="history" element={<History />} />
        <Route path="watch-later" element={<WatchLater />} />
        <Route path="liked" element={<Liked />} />
        <Route path="watch/:videoId" element={<Watch />} />
      </Route>
    </Routes>
  );
}

export default App;
