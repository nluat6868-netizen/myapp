import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Container,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Chip,
  Paper,
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  DragIndicator,
} from '@mui/icons-material'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import Toast from '../components/Toast'

const attributeTypes = [
  { value: 'text', label: 'Text' },
  { value: 'number', label: 'Number' },
  { value: 'email', label: 'Email' },
  { value: 'textarea', label: 'Textarea' },
  { value: 'file', label: 'File' },
  { value: 'selection', label: 'Selection Option' },
  { value: 'image-gallery', label: 'Gallery Hình ảnh (Nhiều ảnh)' },
]

function SortableAttributeItem({ attribute, onEdit, onDelete }) {
  const attributeId = attribute._id || attribute.id
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: attributeId })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <Paper
      ref={setNodeRef}
      style={style}
      sx={{
        p: 2,
        mb: 2,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        cursor: 'grab',
        '&:active': {
          cursor: 'grabbing',
        },
      }}
    >
      <Box
        {...attributes}
        {...listeners}
        sx={{
          display: 'flex',
          alignItems: 'center',
          color: 'text.secondary',
          cursor: 'grab',
        }}
      >
        <DragIndicator />
      </Box>
      <Box sx={{ flex: 1 }}>
        <Typography variant="subtitle1" fontWeight={600}>
          {attribute.name}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
          <Chip label={attributeTypes.find((t) => t.value === attribute.type)?.label || attribute.type} size="small" />
          {attribute.type === 'selection' && attribute.options && (
            <Chip label={`${attribute.options.length} options`} size="small" variant="outlined" />
          )}
          {attribute.required && <Chip label="Bắt buộc" size="small" color="error" />}
        </Box>
      </Box>
      <IconButton size="small" color="primary" onClick={() => onEdit(attribute)}>
        <EditIcon />
      </IconButton>
      <IconButton size="small" color="error" onClick={() => onDelete(attributeId)}>
        <DeleteIcon />
      </IconButton>
    </Paper>
  )
}

function Attributes() {
  const dispatch = useDispatch()
  const { attributes, loading, error } = useSelector((state) => state.productAttributes)
  const [openDialog, setOpenDialog] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    type: 'text',
    required: false,
    options: '',
  })
  const [errors, setErrors] = useState({})
  const [toast, setToast] = useState({ open: false, message: '', severity: 'info' })

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Load attributes from API
  useEffect(() => {
    dispatch({ type: 'GET_ATTRIBUTES_REQUEST' })
  }, [dispatch])

  // Handle error from Redux
  useEffect(() => {
    if (error) {
      setToast({ open: true, message: error, severity: 'error' })
    }
  }, [error])

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Tên thuộc tính không được để trống'
    }

    if (formData.type === 'selection' && !formData.options.trim()) {
      newErrors.options = 'Vui lòng nhập các lựa chọn (phân cách bằng dấu phẩy)'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleOpenDialog = (attribute = null) => {
    if (attribute) {
      setEditingId(attribute._id || attribute.id)
      setFormData({
        name: attribute.name,
        type: attribute.type,
        required: attribute.required || false,
        options: attribute.options ? attribute.options.join(', ') : '',
      })
    } else {
      setEditingId(null)
      setFormData({
        name: '',
        type: 'text',
        required: false,
        options: '',
      })
    }
    setErrors({})
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setEditingId(null)
    setFormData({
      name: '',
      type: 'text',
      required: false,
      options: '',
    })
    setErrors({})
  }

  const handleSave = () => {
    if (!validateForm()) return

    const attributeData = {
      name: formData.name,
      type: formData.type,
      required: formData.required,
    }

    if (formData.type === 'selection') {
      attributeData.options = formData.options
        .split(',')
        .map((opt) => opt.trim())
        .filter((opt) => opt.length > 0)
    }

    if (editingId) {
      dispatch({ type: 'UPDATE_ATTRIBUTE_REQUEST', payload: { id: editingId, attributeData } })
      setToast({
        open: true,
        message: 'Cập nhật thuộc tính thành công!',
        severity: 'success',
      })
    } else {
      dispatch({ type: 'CREATE_ATTRIBUTE_REQUEST', payload: attributeData })
      setToast({
        open: true,
        message: 'Thêm thuộc tính thành công!',
        severity: 'success',
      })
    }

    handleCloseDialog()
    setTimeout(() => setToast((prev) => ({ ...prev, open: false })), 3000)
  }

  const handleDelete = (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa thuộc tính này?')) {
      dispatch({ type: 'DELETE_ATTRIBUTE_REQUEST', payload: id })
      setToast({
        open: true,
        message: 'Xóa thuộc tính thành công!',
        severity: 'success',
      })
      setTimeout(() => setToast((prev) => ({ ...prev, open: false })), 3000)
    }
  }

  const handleDragEnd = (event) => {
    const { active, over } = event

    if (active.id !== over.id && attributes) {
      const oldIndex = attributes.findIndex((item) => (item._id || item.id) === active.id)
      const newIndex = attributes.findIndex((item) => (item._id || item.id) === over.id)
      const newItems = arrayMove([...attributes], oldIndex, newIndex)
      // Update order
      const updatedAttributes = newItems.map((item, index) => ({ ...item, order: index }))
      dispatch({ type: 'UPDATE_ATTRIBUTE_ORDER_REQUEST', payload: updatedAttributes })
    }
  }

  return (
    <Container maxWidth="lg" sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
          Thuộc tính sản phẩm
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Quản lý các thuộc tính cho sản phẩm. Kéo thả để sắp xếp thứ tự.
        </Typography>
      </Box>

      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Thêm thuộc tính
        </Button>
      </Box>

      {loading && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Đang tải dữ liệu...
        </Alert>
      )}

      {!loading && (!attributes || attributes.length === 0) ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="body1" color="text.secondary">
              Chưa có thuộc tính nào. Hãy thêm thuộc tính đầu tiên!
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={(attributes || []).map((attr) => attr._id || attr.id)}
                strategy={verticalListSortingStrategy}
              >
                {(attributes || []).map((attribute) => (
                  <SortableAttributeItem
                    key={attribute._id || attribute.id}
                    attribute={attribute}
                    onEdit={handleOpenDialog}
                    onDelete={handleDelete}
                  />
                ))}
              </SortableContext>
            </DndContext>
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Chỉnh sửa thuộc tính' : 'Thêm thuộc tính mới'}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Tên thuộc tính"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              error={!!errors.name}
              helperText={errors.name}
              required
              sx={{ mb: 3 }}
            />

            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Loại thuộc tính</InputLabel>
              <Select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                label="Loại thuộc tính"
              >
                {attributeTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {formData.type === 'selection' && (
              <TextField
                fullWidth
                label="Các lựa chọn (phân cách bằng dấu phẩy)"
                name="options"
                value={formData.options}
                onChange={handleInputChange}
                error={!!errors.options}
                helperText={errors.options || 'Ví dụ: Option 1, Option 2, Option 3'}
                required
                sx={{ mb: 3 }}
                multiline
                rows={3}
              />
            )}

            <FormControl fullWidth>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <input
                  type="checkbox"
                  name="required"
                  checked={formData.required}
                  onChange={handleInputChange}
                  id="required-checkbox"
                />
                <label htmlFor="required-checkbox" style={{ marginLeft: 8 }}>
                  <Typography variant="body2">Thuộc tính bắt buộc</Typography>
                </label>
              </Box>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} startIcon={<CancelIcon />}>
            Hủy
          </Button>
          <Button onClick={handleSave} variant="contained" startIcon={<SaveIcon />}>
            Lưu
          </Button>
        </DialogActions>
      </Dialog>

      <Toast
        open={toast.open}
        message={toast.message}
        severity={toast.severity}
        onClose={() => setToast({ ...toast, open: false })}
      />
    </Container>
  )
}

export default Attributes

