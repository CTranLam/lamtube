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
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell sx={{ color: "#0f172a", fontWeight: 600 }}>ID</TableCell>
          <TableCell sx={{ color: "#0f172a", fontWeight: 600 }}>
            Tên danh mục
          </TableCell>
          <TableCell sx={{ color: "#0f172a", fontWeight: 600 }} align="right">
            Thao tác
          </TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {categories.map((c) => (
          <TableRow key={c.id} hover>
            <TableCell sx={{ color: "#0f172a" }}>{c.id}</TableCell>
            <TableCell sx={{ color: "#0f172a" }}>{c.name}</TableCell>
            <TableCell sx={{ color: "#0f172a" }} align="right">
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
