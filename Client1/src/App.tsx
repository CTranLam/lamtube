import { Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout.tsx";
import AdminLayout from "./layouts/AdminLayout.tsx";
import Home from "./pages/Home.tsx";
import Watch from "./pages/Watch.tsx";
import Login from "./pages/Login.tsx";
import Register from "./pages/Register.tsx";
import Channel from "./pages/Channel";
import UploadVideo from "./pages/UploadVideo.tsx";
import AdminDashboard from "./pages/admin/AdminDashboard.tsx";
import UserManagement from "./pages/admin/UserManagement.tsx";
import CategoryManagement from "./pages/admin/CategoryManagement.tsx";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="categories" element={<CategoryManagement />} />
      </Route>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="channel" element={<Channel />} />
        <Route path="upload" element={<UploadVideo />} />
        <Route path="watch/:videoId" element={<Watch />} />
      </Route>
    </Routes>
  );
}

export default App;
