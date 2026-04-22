import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import type { CategorySummary } from "../../types/auth";

interface CategoryTableProps {
  categories: CategorySummary[];
  onEdit: (c: CategorySummary) => void;
  onDelete: (c: CategorySummary) => void;
}

export const CategoryTable = ({
  categories,
  onEdit,
  onDelete,
}: CategoryTableProps) => {
  return (
    <Table
      size="small"
      sx={{
        bgcolor: "#181818",
        borderRadius: 2,
        overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.12)",
        "& td, & th": {
          color: "#f4f4f5",
          borderColor: "rgba(255,255,255,0.08)",
        },
      }}
    >
      <TableHead>
        <TableRow sx={{ bgcolor: "rgba(255,255,255,0.02)" }}>
          <TableCell sx={{ fontWeight: 600 }}>ID</TableCell>
          <TableCell sx={{ fontWeight: 600 }}>
            Tên danh mục
          </TableCell>
          <TableCell sx={{ fontWeight: 600 }} align="right">
            Thao tác
          </TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {categories.map((c) => (
          <TableRow
            key={c.id}
            hover
            sx={{
              "&:hover": { bgcolor: "rgba(255,255,255,0.03)" },
            }}
          >
            <TableCell>{c.id}</TableCell>
            <TableCell>{c.name}</TableCell>
            <TableCell align="right">
              <IconButton
                size="small"
                color="primary"
                onClick={() => onEdit(c)}
              >
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                color="error"
                onClick={() => onDelete(c)}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
