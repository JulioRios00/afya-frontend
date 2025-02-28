import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
  GridToolbar,
} from "@mui/x-data-grid";
import { Box, Button, Chip, IconButton, Typography } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { Product, Category } from "@/types";

interface ProductsTableProps {
  products: Product[];
  categories: Category[];
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
}

export default function ProductsTable({
  products,
  categories,
  onEdit,
  onDelete,
}: ProductsTableProps) {
  const getCategoryNames = (categoryIds: string[]): string[] => {
    return categoryIds.map((id) => {
      const category = categories.find((cat) => cat._id === id);
      return category ? category.name : "Unknown";
    });
  };

  const columns: GridColDef[] = [
    {
      field: "name",
      headerName: "Name",
      flex: 1,
      minWidth: 200,
    },
    {
      field: "description",
      headerName: "Description",
      flex: 1.5,
      minWidth: 250,
      renderCell: (params: GridRenderCellParams<Product>) => (
        <Typography
          variant="body2"
          sx={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}
        >
          {params.value}
        </Typography>
      ),
    },
    {
      field: "price",
      headerName: "Price",
      width: 120,
      renderCell: (params: GridRenderCellParams<Product>) => (
        <Typography>${params.value}</Typography>
      ),
    },
    {
      field: "category_ids",
      headerName: "Categories",
      flex: 1,
      minWidth: 150,
      renderCell: (params: GridRenderCellParams<Product>) => (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
          {getCategoryNames(params.value as string[]).map((name, index) => (
            <Chip key={index} label={name} size="small" />
          ))}
        </Box>
      ),
    },
    {
      field: "image_url",
      headerName: "Image",
      width: 120,
      renderCell: (params: GridRenderCellParams<Product>) =>
        params.value ? (
          <Box
            component="img"
            sx={{
              height: 40,
              width: 40,
              objectFit: "cover",
              borderRadius: 1,
            }}
            src={params.value}
            alt={params.row.name}
          />
        ) : (
          <Typography variant="body2" color="text.secondary">
            No image
          </Typography>
        ),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 120,
      renderCell: (params: GridRenderCellParams<Product>) => (
        <Box>
          <IconButton
            size="small"
            color="primary"
            onClick={() => onEdit(params.row)}
            aria-label="edit"
          >
            <EditIcon />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            onClick={() => onDelete(params.row._id)}
            aria-label="delete"
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <div style={{ height: 600, width: "100%" }}>
      <DataGrid
        rows={products.map((p) => ({ ...p, id: p._id }))}
        columns={columns}
        autoPageSize
        disableRowSelectionOnClick
        slots={{ toolbar: GridToolbar }}
        slotProps={{
          toolbar: {
            showQuickFilter: true,
          },
        }}
      />
    </div>
  );
}
