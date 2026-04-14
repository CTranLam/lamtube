# 📺 YouTube Clone - React Training Project

Dự án mô phỏng nền tảng xem video YouTube, tập trung vào việc áp dụng các công nghệ Frontend hiện đại để quản lý trạng thái, hiệu suất và dữ liệu từ Server.

---

## 🚀 Tech Stack

- **Core:** [React.js](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) (Vite)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) + [Shadcn/ui](https://ui.shadcn.com/)
- **Data Fetching:** [@tanstack/react-query](https://tanstack.com/query/latest) (Xử lý Caching, Loading, Error)
- **Form Management:** [React Hook Form](https://react-hook-form.com/) (Xử lý Uncontrolled Inputs & Validation)
- **Routing:** [React Router v6](https://reactrouter.com/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **API Client:** [Axios](https://axios-http.com/)

---

## 🏗️ Kiến trúc thư mục (Folder Structure)

Dự án tuân thủ kiến trúc **Separation of Concerns (SoC)** để đảm bảo tính mở rộng và dễ bảo trì:

```text
src/
├── api/             # Cấu hình Axios & các hàm gọi API (Services)
├── assets/          # Static files (Images, Icons, Global CSS)
├── components/      # Các thành phần giao diện tái sử dụng
│   ├── ui/          # Hệ thống Design System từ Shadcn/ui
│   ├── common/      # Navbar, Sidebar, Footer (Dùng toàn App)
│   └── video/       # VideoCard, VideoList, VideoPlayer
├── constants/       # Các hằng số (API_URL, ROUTE_PATHS, ENUMS)
├── hooks/           # Custom Hooks (useVideos, useAuth, useDebounce)
├── layouts/         # Các khung bao bọc (MainLayout, AuthLayout)
├── pages/           # View chính cho từng Route (Home, Watch, Search)
├── store/           # Quản lý Global State (Zustand hoặc Context API)
├── types/           # Định nghĩa TypeScript Interfaces/Types
├── utils/           # Các hàm bổ trợ (FormatDate, ViewCountFormatter)
├── App.tsx          # Cấu hình Router & Providers
└── main.tsx         # Điểm khởi đầu của ứng dụng
```

```text
index.html
└── main.tsx (Điểm tiếp nhận)
    └── <QueryClientProvider> (Cấp dữ liệu)
        └── <BrowserRouter> (Cấp khả năng điều hướng)
            └── App.tsx (Bắt đầu điều hướng các trang)
                ├── <MainLayout>
                │   └── <HomePage />
                └── <WatchPage />

Cấu trúc này giống như những con búp bê lồng vào nhau, con to chứa con nhỏ:

index.html (Vỏ to nhất): Chứa cái lỗ #root.

main.tsx (Chui vào #root): Chứa các bộ máy tổng (QueryClient, BrowserRouter).

App.tsx (Chui vào main.tsx): Chứa bản đồ đường đi (Routes).

Layout.tsx (Chui vào Route): Chứa khung xương (Navbar, Sidebar).

Page.tsx (Chui vào Layout): Chứa nội dung thực tế (Home, Watch).
```