import { useMemo, useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Link,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Link as RouterLink } from "react-router-dom";

type HelpTopic = {
  id: string;
  question: string;
  answer: string;
};

const HELP_TOPICS: HelpTopic[] = [
  {
    id: "upload",
    question: "Làm sao để tải video lên?",
    answer:
      "Bạn vào mục Upload trên thanh điều hướng, nhập tiêu đề, mô tả và chọn tệp video để đăng.",
  },
  {
    id: "privacy",
    question: "Mình có thể đặt video ở chế độ riêng tư không?",
    answer:
      "Có. Khi tải video, bạn có thể chọn trạng thái public hoặc private trước khi xuất bản.",
  },
  {
    id: "account",
    question: "Quên mật khẩu thì làm gì?",
    answer:
      "Hiện tại bạn có thể liên hệ đội hỗ trợ qua trang Gửi phản hồi để được cấp lại mật khẩu.",
  },
  {
    id: "search",
    question: "Tại sao không tìm thấy video mong muốn?",
    answer:
      "Hãy thử từ khóa ngắn hơn, bỏ dấu câu hoặc kiểm tra bộ lọc danh mục đang chọn ở trang chủ.",
  },
  {
    id: "channel",
    question: "Làm sao chỉnh sửa hồ sơ kênh?",
    answer:
      "Vào trang Kênh của bạn, chuyển sang tab Thông tin cá nhân để cập nhật tên và mô tả.",
  },
];

export default function Help() {
  const [keyword, setKeyword] = useState("");

  const filteredTopics = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();
    if (!normalizedKeyword) return HELP_TOPICS;

    return HELP_TOPICS.filter((topic) => {
      const content = `${topic.question} ${topic.answer}`.toLowerCase();
      return content.includes(normalizedKeyword);
    });
  }, [keyword]);

  return (
    <Box sx={{ maxWidth: 860, mx: "auto", p: { xs: 1, sm: 2 } }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
        Trợ giúp
      </Typography>
      <Typography variant="body2" sx={{ color: "#aaaaaa", mb: 3 }}>
        Tìm câu trả lời nhanh cho các vấn đề thường gặp.
      </Typography>

      <Paper sx={{ bgcolor: "#181818", p: { xs: 2, sm: 3 }, borderRadius: 3, mb: 2 }}>
        <TextField
          fullWidth
          placeholder="Tìm kiếm trong trợ giúp..."
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
        />
      </Paper>

      <Paper sx={{ bgcolor: "#181818", p: { xs: 1, sm: 2 }, borderRadius: 3 }}>
        {filteredTopics.length === 0 && (
          <Typography sx={{ px: 1, py: 2, color: "#aaaaaa" }}>
            Không có kết quả phù hợp với từ khóa "{keyword.trim()}".
          </Typography>
        )}

        {filteredTopics.map((topic) => (
          <Accordion
            key={topic.id}
            disableGutters
            elevation={0}
            sx={{ bgcolor: "transparent", color: "#fff", "&:before": { display: "none" } }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: "#fff" }} />}>
              <Typography sx={{ fontWeight: 600 }}>{topic.question}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" sx={{ color: "#d4d4d4" }}>
                {topic.answer}
              </Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </Paper>

      <Typography variant="body2" sx={{ color: "#aaaaaa", mt: 2 }}>
        Không thấy câu trả lời? Gửi phản hồi tại trang{" "}
        <Link
          component={RouterLink}
          to="/feedback"
          underline="hover"
          color="primary.main"
        >
          Gửi phản hồi
        </Link>
        .
      </Typography>
    </Box>
  );
}
