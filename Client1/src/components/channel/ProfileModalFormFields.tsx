import React from "react";
import { TextField } from "@mui/material";

type FormData = { fullName: string; bio: string };

type Props = {
  prefix: string;
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  isLoading: boolean;
};

export default function FormFields({
  prefix,
  formData,
  setFormData,
  isLoading,
}: Props) {
  return (
    <>
      <TextField
        label="Họ và tên"
        fullWidth
        value={formData.fullName}
        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
        variant="outlined"
        disabled={isLoading}
        InputLabelProps={{ sx: { color: "#aaa" } }}
        inputProps={{
          sx: { color: "#fff" },
          "data-testid": `${prefix}-fullName`,
        }}
        sx={{
          "& .MuiOutlinedInput-root": {
            "& fieldset": { borderColor: "#444" },
          },
        }}
      />

      <TextField
        label="Tiểu sử"
        fullWidth
        multiline
        rows={4}
        value={formData.bio}
        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
        variant="outlined"
        disabled={isLoading}
        InputLabelProps={{ sx: { color: "#aaa" } }}
        inputProps={{ sx: { color: "#fff" }, "data-testid": `${prefix}-bio` }}
        sx={{
          "& .MuiOutlinedInput-root": {
            "& fieldset": { borderColor: "#444" },
          },
        }}
      />
    </>
  );
}
