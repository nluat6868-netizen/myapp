import { useState, useEffect } from 'react'
import {
  Container,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  IconButton,
  Paper,
  Alert,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  FormHelperText,
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Visibility as VisibilityIcon,
  DragIndicator,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon,
} from '@mui/icons-material'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
  DragOverlay,
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

// Template mẫu
const defaultTemplates = [
  {
    id: 'template-1',
    name: 'Template Cơ bản',
    description: 'Template đơn giản với các thuộc tính cơ bản',
    templateType: 'data', // 'information' hoặc 'data'
    searchAttributes: [],
    displayAttributes: [],
    isDefault: true,
  },
  {
    id: 'template-2',
    name: 'Template E-commerce',
    description: 'Template cho cửa hàng online với tìm kiếm nâng cao',
    templateType: 'data', // 'information' hoặc 'data'
    searchAttributes: [],
    displayAttributes: [],
    isDefault: true,
  },
]

// Draggable attribute from sidebar
function DraggableAttribute({ attribute }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `source-${attribute.id}`,
    data: { attribute, source: 'sidebar' },
  })

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <Paper
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      sx={{
        p: 1.5,
        mb: 1,
        cursor: 'grab',
        '&:active': {
          cursor: 'grabbing',
        },
        '&:hover': {
          bgcolor: 'action.hover',
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <DragIndicator sx={{ color: 'text.secondary' }} />
        <Box sx={{ flex: 1 }}>
          <Typography variant="body2" fontWeight={600}>
            {attribute.name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {attribute.type}
          </Typography>
        </Box>
      </Box>
    </Paper>
  )
}

// Sortable attribute in editor
function SortableAttributeItem({ attribute, onRemove, index }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: attribute.id })

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
        p: 1.5,
        mb: 1,
        display: 'flex',
        alignItems: 'center',
        gap: 1,
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
      <Chip label={index + 1} size="small" color="primary" />
      <Box sx={{ flex: 1 }}>
        <Typography variant="body2" fontWeight={600}>
          {attribute.name}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {attribute.type}
        </Typography>
      </Box>
      <IconButton
        size="small"
        color="error"
        onClick={() => onRemove(attribute.id)}
      >
        <DeleteIcon fontSize="small" />
      </IconButton>
    </Paper>
  )
}

// Drop zone for editor
function EditorDropZone({ children, type, label }) {
  const { setNodeRef, isOver } = useDroppable({
    id: `editor-${type}`,
    data: { type },
  })

  return (
    <Box
      ref={setNodeRef}
      sx={{
        minHeight: { xs: 250, sm: 300, md: 400 },
        p: { xs: 1.5, sm: 2 },
        borderRadius: 2,
        border: '2px dashed',
        borderColor: isOver ? 'primary.main' : 'divider',
        bgcolor: isOver ? 'action.selected' : 'background.paper',
        transition: 'all 0.2s',
      }}
    >
      <Typography
        variant="subtitle2"
        gutterBottom
        color={isOver ? 'primary.main' : 'text.secondary'}
        sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
      >
        {label}
      </Typography>
      {children}
    </Box>
  )
}

function Templates() {
  const [attributes, setAttributes] = useState([])
  const [templates, setTemplates] = useState(() => {
    const saved = localStorage.getItem('templates')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        // Đảm bảo các template cũ có templateType mặc định
        return parsed.map((template) => ({
          ...template,
          templateType: template.templateType || 'data',
        }))
      } catch (error) {
        console.error('Error parsing templates:', error)
        return defaultTemplates
      }
    }
    return defaultTemplates
  })
  const [selectedTemplates, setSelectedTemplates] = useState(() => {
    const saved = localStorage.getItem('selectedTemplates')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch (error) {
        console.error('Error parsing selected templates:', error)
        return { data: null, information: null }
      }
    }
    // Backward compatibility: check old selectedTemplateId
    const oldSelected = localStorage.getItem('selectedTemplateId')
    if (oldSelected) {
      try {
        const savedTemplates = localStorage.getItem('templates')
        if (savedTemplates) {
          const parsed = JSON.parse(savedTemplates)
          const template = parsed.find((t) => t.id === oldSelected)
          if (template) {
            return {
              data: template.templateType === 'data' ? template.id : null,
              information: template.templateType === 'information' ? template.id : null,
            }
          }
        }
      } catch (error) {
        console.error('Error parsing templates for backward compatibility:', error)
      }
    }
    return { data: null, information: null }
  })
  const [openDialog, setOpenDialog] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    templateType: 'data', // 'information' hoặc 'data'
    searchAttributes: [],
    displayAttributes: [],
  })
  const [errors, setErrors] = useState({})
  const [toast, setToast] = useState({ open: false, message: '', severity: 'info' })
  const [previewTemplate, setPreviewTemplate] = useState(null)
  const [activeId, setActiveId] = useState(null)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  useEffect(() => {
    const attrs = JSON.parse(localStorage.getItem('productAttributes') || '[]')
    setAttributes(attrs.sort((a, b) => (a.order || 0) - (b.order || 0)))
  }, [])

  // Debounced save to localStorage
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      try {
        localStorage.setItem('templates', JSON.stringify(templates))
      } catch (error) {
        console.error('Error saving templates to localStorage:', error)
      }
    }, 300) // Debounce 300ms

    return () => clearTimeout(timeoutId)
  }, [templates])

  // Save selected templates to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('selectedTemplates', JSON.stringify(selectedTemplates))
      // Remove old selectedTemplateId for backward compatibility
      localStorage.removeItem('selectedTemplateId')
    } catch (error) {
      console.error('Error saving selected templates:', error)
    }
  }, [selectedTemplates])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }))
    }
  }

  const handleRemoveAttribute = (attributeId, type) => {
    setFormData((prev) => {
      const newFormData = {
        ...prev,
        [type]: prev[type].filter((attr) => attr.id !== attributeId),
      }
      // Auto-save if editing
      if (editingId) {
        autoSaveTemplate(newFormData)
      }
      return newFormData
    })
  }

  const autoSaveTemplate = (newFormData) => {
    if (!editingId) return

    const editingTemplate = templates.find((t) => t.id === editingId)
    if (!editingTemplate) return

    const templateData = {
      ...editingTemplate,
      name: newFormData.name || editingTemplate.name,
      description: newFormData.description || editingTemplate.description,
      templateType: newFormData.templateType || editingTemplate.templateType || 'data',
      searchAttributes: newFormData.searchAttributes || [],
      displayAttributes: newFormData.displayAttributes || [],
      updatedAt: new Date().toISOString(),
    }

    setTemplates((prev) =>
      prev.map((template) =>
        template.id === editingId ? templateData : template
      )
    )
  }

  const handleDragStart = (event) => {
    setActiveId(event.active.id)
  }

  const handleDragEnd = (event) => {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    const activeIdStr = String(active.id)
    const overIdStr = String(over.id)

    // Handle drag from sidebar to editor
    if (activeIdStr.startsWith('source-')) {
      const attributeId = activeIdStr.replace('source-', '')
      const attribute = attributes.find((attr) => attr.id === attributeId)
      if (!attribute) return

      // Check if dropped on a drop zone
      if (overIdStr.startsWith('editor-')) {
        const dropZoneType = overIdStr.replace('editor-', '')
        // Chỉ cho phép drop vào drop zone phù hợp với loại template
        if (formData.templateType === 'information' && dropZoneType === 'searchAttributes') {
          setFormData((prev) => {
            const currentList = prev[dropZoneType] || []
            // Check if already exists
            if (currentList.some((attr) => attr.id === attributeId)) {
              return prev
            }
            const newFormData = {
              ...prev,
              [dropZoneType]: [...currentList, attribute],
            }
            // Auto-save if editing
            if (editingId) {
              autoSaveTemplate(newFormData)
            }
            return newFormData
          })
        } else if (formData.templateType === 'data' && dropZoneType === 'displayAttributes') {
          setFormData((prev) => {
            const currentList = prev[dropZoneType] || []
            // Check if already exists
            if (currentList.some((attr) => attr.id === attributeId)) {
              return prev
            }
            const newFormData = {
              ...prev,
              [dropZoneType]: [...currentList, attribute],
            }
            // Auto-save if editing
            if (editingId) {
              autoSaveTemplate(newFormData)
            }
            return newFormData
          })
        }
      }
      // Check if dropped on an existing item in the list (insert before/after)
      else {
        // Chỉ cho phép drop vào list phù hợp với loại template
        if (formData.templateType === 'information') {
          const isInSearch = formData.searchAttributes.some((attr) => attr.id === overIdStr)
          if (isInSearch) {
            setFormData((prev) => {
              const currentList = prev.searchAttributes || []
              if (currentList.some((attr) => attr.id === attributeId)) {
                return prev
              }
              const insertIndex = currentList.findIndex((attr) => attr.id === overIdStr)
              const newList = [...currentList]
              newList.splice(insertIndex, 0, attribute)
              const newFormData = {
                ...prev,
                searchAttributes: newList,
              }
              // Auto-save if editing
              if (editingId) {
                autoSaveTemplate(newFormData)
              }
              return newFormData
            })
          }
        } else if (formData.templateType === 'data') {
          const isInDisplay = formData.displayAttributes.some((attr) => attr.id === overIdStr)
          if (isInDisplay) {
            setFormData((prev) => {
              const currentList = prev.displayAttributes || []
              if (currentList.some((attr) => attr.id === attributeId)) {
                return prev
              }
              const insertIndex = currentList.findIndex((attr) => attr.id === overIdStr)
              const newList = [...currentList]
              newList.splice(insertIndex, 0, attribute)
              const newFormData = {
                ...prev,
                displayAttributes: newList,
              }
              // Auto-save if editing
              if (editingId) {
                autoSaveTemplate(newFormData)
              }
              return newFormData
            })
          }
        }
      }
    }
    // Handle reordering within editor
    else if (activeIdStr !== overIdStr) {
      // Chỉ cho phép reorder trong list phù hợp với loại template
      if (formData.templateType === 'information') {
        const isInSearch = formData.searchAttributes.some((attr) => attr.id === activeIdStr)
        if (isInSearch && formData.searchAttributes.some((attr) => attr.id === overIdStr)) {
          const items = formData.searchAttributes
          const oldIndex = items.findIndex((item) => item.id === activeIdStr)
          const newIndex = items.findIndex((item) => item.id === overIdStr)
          if (oldIndex !== -1 && newIndex !== -1) {
            setFormData((prev) => {
              const newFormData = {
                ...prev,
                searchAttributes: arrayMove(items, oldIndex, newIndex),
              }
              // Auto-save if editing
              if (editingId) {
                autoSaveTemplate(newFormData)
              }
              return newFormData
            })
          }
        }
      } else if (formData.templateType === 'data') {
        const isInDisplay = formData.displayAttributes.some((attr) => attr.id === activeIdStr)
        if (isInDisplay && formData.displayAttributes.some((attr) => attr.id === overIdStr)) {
          const items = formData.displayAttributes
          const oldIndex = items.findIndex((item) => item.id === activeIdStr)
          const newIndex = items.findIndex((item) => item.id === overIdStr)
          if (oldIndex !== -1 && newIndex !== -1) {
            setFormData((prev) => {
              const newFormData = {
                ...prev,
                displayAttributes: arrayMove(items, oldIndex, newIndex),
              }
              // Auto-save if editing
              if (editingId) {
                autoSaveTemplate(newFormData)
              }
              return newFormData
            })
          }
        }
      }
    }
  }

  const validateForm = () => {
    const newErrors = {}
    if (!formData.name.trim()) {
      newErrors.name = 'Tên template không được để trống'
    }
    // Nếu là template tra cứu thông tin, cần có thuộc tính tìm kiếm
    if (formData.templateType === 'information' && formData.searchAttributes.length === 0) {
      newErrors.searchAttributes = 'Vui lòng chọn ít nhất một thuộc tính để tìm kiếm'
    }
    // Nếu là template dữ liệu trả về, cần có thuộc tính hiển thị
    if (formData.templateType === 'data' && formData.displayAttributes.length === 0) {
      newErrors.displayAttributes = 'Vui lòng chọn ít nhất một thuộc tính để hiển thị'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSelectTemplate = (templateId) => {
    const template = templates.find((t) => t.id === templateId)
    if (!template) return

    const templateType = template.templateType || 'data'
    const currentSelected = selectedTemplates[templateType]

    setSelectedTemplates((prev) => {
      const newSelected = {
        ...prev,
        [templateType]: templateId === currentSelected ? null : templateId,
      }
      return newSelected
    })

    const isSelected = templateId === currentSelected
    const typeLabel = templateType === 'information' ? 'tra cứu thông tin' : 'dữ liệu trả về'
    
    setToast({
      open: true,
      message: isSelected 
        ? `Đã bỏ chọn template ${typeLabel}` 
        : `Đã chọn template ${typeLabel} thành công!`,
      severity: 'success',
    })
    setTimeout(() => setToast((prev) => ({ ...prev, open: false })), 3000)
  }

  const handleOpenDialog = (template = null) => {
    if (template) {
      setEditingId(template.id)
      setFormData({
        name: template.name,
        description: template.description || '',
        templateType: template.templateType || 'data',
        searchAttributes: template.searchAttributes || [],
        displayAttributes: template.displayAttributes || [],
      })
    } else {
      setEditingId(null)
      setFormData({
        name: '',
        description: '',
        templateType: 'data',
        searchAttributes: [],
        displayAttributes: [],
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
      description: '',
      templateType: 'data',
      searchAttributes: [],
      displayAttributes: [],
    })
    setErrors({})
  }

  const handleSave = () => {
    if (!validateForm()) return

    const editingTemplate = templates.find((t) => t.id === editingId)
    const templateData = {
      name: formData.name,
      description: formData.description,
      templateType: formData.templateType || 'data',
      searchAttributes: formData.searchAttributes,
      displayAttributes: formData.displayAttributes,
      isDefault: editingTemplate?.isDefault || false,
      createdAt: editingTemplate?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    if (editingId) {
      setTemplates((prev) =>
        prev.map((template) =>
          template.id === editingId ? { ...template, ...templateData } : template
        )
      )
      setToast({
        open: true,
        message: 'Cập nhật template thành công!',
        severity: 'success',
      })
    } else {
      const newTemplate = {
        id: `template-${Date.now()}`,
        ...templateData,
      }
      setTemplates((prev) => [...prev, newTemplate])
      setToast({
        open: true,
        message: 'Tạo template thành công!',
        severity: 'success',
      })
    }

    handleCloseDialog()
    setTimeout(() => setToast({ ...toast, open: false }), 3000)
  }

  const handleDelete = (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa template này?')) {
      setTemplates((prev) => prev.filter((template) => template.id !== id))
      setToast({
        open: true,
        message: 'Xóa template thành công!',
        severity: 'success',
      })
      setTimeout(() => setToast({ ...toast, open: false }), 3000)
    }
  }

  const handlePreview = (template) => {
    setPreviewTemplate(template)
  }

  return (
    <Container maxWidth="xl" sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ mb: { xs: 2, md: 4 } }}>
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          fontWeight={600}
          sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' } }}
        >
          Quản lý Template
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
          Tạo và tùy chỉnh template trả về cho khách hàng dựa trên các thuộc tính
        </Typography>
      </Box>

      <Box sx={{ mb: { xs: 2, md: 3 }, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          fullWidth={{ xs: true, sm: false }}
        >
          Tạo Template mới
        </Button>
      </Box>

      <Grid container spacing={{ xs: 2, sm: 3 }}>
        {templates.map((template) => (
          <Grid item xs={12} sm={6} md={4} key={template.id}>
            <Card
              sx={{
                border: selectedTemplates[template.templateType || 'data'] === template.id ? 2 : 1,
                borderColor: selectedTemplates[template.templateType || 'data'] === template.id ? 'primary.main' : 'divider',
                position: 'relative',
              }}
            >
              {selectedTemplates[template.templateType || 'data'] === template.id && (
                <Chip
                  label="Đang sử dụng"
                  color="primary"
                  size="small"
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    zIndex: 1,
                  }}
                />
              )}
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Typography variant="h6">
                        {template.name}
                      </Typography>
                      {template.isDefault && (
                        <Chip label="Mẫu" size="small" color="primary" />
                      )}
                      <Chip
                        label={template.templateType === 'information' ? 'Tra cứu thông tin' : 'Dữ liệu trả về'}
                        size="small"
                        color={template.templateType === 'information' ? 'info' : 'success'}
                        variant="outlined"
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {template.description || 'Không có mô tả'}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ mb: 2 }}>
                  {template.templateType === 'information' ? (
                    <Typography variant="caption" color="text.secondary">
                      Tìm kiếm: {template.searchAttributes?.length || 0} thuộc tính
                    </Typography>
                  ) : (
                    <Typography variant="caption" color="text.secondary">
                      Hiển thị: {template.displayAttributes?.length || 0} thuộc tính
                    </Typography>
                  )}
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Button
                    fullWidth
                    variant={selectedTemplates[template.templateType || 'data'] === template.id ? 'contained' : 'outlined'}
                    startIcon={selectedTemplates[template.templateType || 'data'] === template.id ? <CheckCircleIcon /> : <RadioButtonUncheckedIcon />}
                    onClick={() => handleSelectTemplate(template.id)}
                    sx={{ mb: 1 }}
                  >
                    {selectedTemplates[template.templateType || 'data'] === template.id ? 'Đã chọn' : 'Chọn template'}
                  </Button>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<VisibilityIcon />}
                      onClick={() => handlePreview(template)}
                      sx={{ flex: 1 }}
                    >
                      Xem
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<EditIcon />}
                      onClick={() => handleOpenDialog(template)}
                      sx={{ flex: 1 }}
                    >
                      Sửa
                    </Button>
                    {!template.isDefault && (
                      <Button
                        size="small"
                        color="error"
                        variant="outlined"
                        startIcon={<DeleteIcon />}
                        onClick={() => handleDelete(template.id)}
                        sx={{ flex: 1 }}
                      >
                        Xóa
                      </Button>
                    )}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Create/Edit Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="lg"
        fullWidth
        fullScreen={window.innerWidth < 900}
        sx={{
          '& .MuiDialog-paper': {
            m: { xs: 0, sm: 2 },
            maxHeight: { xs: '100vh', sm: '90vh' },
          },
        }}
      >
        <DialogTitle>
          {editingId ? 'Chỉnh sửa Template' : 'Tạo Template mới'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Tên template"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              error={!!errors.name}
              helperText={errors.name}
              required
              sx={{ mb: 3 }}
            />

            <TextField
              fullWidth
              label="Mô tả"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              multiline
              rows={2}
              sx={{ mb: 3 }}
            />

            <FormControl fullWidth sx={{ mb: 3 }} required>
              <InputLabel>Loại template</InputLabel>
              <Select
                value={formData.templateType || 'data'}
                onChange={(e) => {
                  const newType = e.target.value
                  // Khi thay đổi loại template, clear các attributes không phù hợp
                  setFormData((prev) => {
                    const newFormData = {
                      ...prev,
                      templateType: newType,
                      // Nếu chuyển sang tra cứu thông tin, clear displayAttributes
                      // Nếu chuyển sang dữ liệu trả về, clear searchAttributes
                      ...(newType === 'information' 
                        ? { displayAttributes: [] }
                        : { searchAttributes: [] }
                      ),
                    }
                    if (editingId) {
                      autoSaveTemplate(newFormData)
                    }
                    return newFormData
                  })
                }}
                label="Loại template"
              >
                <MenuItem value="information">Tra cứu thông tin</MenuItem>
                <MenuItem value="data">Dữ liệu trả về</MenuItem>
              </Select>
              <FormHelperText>
                {formData.templateType === 'information' 
                  ? 'Template tra cứu: chỉ cần thuộc tính tìm kiếm'
                  : 'Template dữ liệu: chỉ cần thuộc tính hiển thị'
                }
              </FormHelperText>
            </FormControl>

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <Grid container spacing={{ xs: 2, sm: 3 }}>
                {/* Left Sidebar - Available Attributes */}
                <Grid item xs={12} md={4}>
                  <Card>
                    <CardContent sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
                      <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                        Thuộc tính có sẵn
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                        Kéo thả vào editor bên phải
                      </Typography>
                      <Box sx={{ maxHeight: { xs: 300, sm: 400, md: 500 }, overflowY: 'auto' }}>
                        {attributes.length === 0 ? (
                          <Alert severity="info">
                            Chưa có thuộc tính nào. Vui lòng tạo thuộc tính trước.
                          </Alert>
                        ) : (
                          attributes.map((attr) => {
                            // Chỉ kiểm tra trong list tương ứng với loại template
                            const isInUse = formData.templateType === 'information'
                              ? formData.searchAttributes.some((a) => a.id === attr.id)
                              : formData.displayAttributes.some((a) => a.id === attr.id)
                            if (isInUse) return null
                            return <DraggableAttribute key={attr.id} attribute={attr} />
                          })
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Right Editor - Drop Zones */}
                <Grid item xs={12} md={8}>
                  <Grid container spacing={{ xs: 1.5, sm: 2 }}>
                    {/* Search Attributes Editor - Chỉ hiển thị khi templateType là 'information' */}
                    {formData.templateType === 'information' && (
                      <Grid item xs={12}>
                        <Card>
                          <CardContent sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
                            <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                              Thuộc tính tìm kiếm
                            </Typography>
                            <EditorDropZone
                              type="searchAttributes"
                              label="Kéo thả thuộc tính vào đây để thêm vào tìm kiếm"
                            >
                              {formData.searchAttributes.length > 0 ? (
                                <SortableContext
                                  items={formData.searchAttributes.map((attr) => attr.id)}
                                  strategy={verticalListSortingStrategy}
                                >
                                  {formData.searchAttributes.map((attribute, index) => (
                                    <SortableAttributeItem
                                      key={attribute.id}
                                      attribute={attribute}
                                      index={index}
                                      onRemove={(id) => handleRemoveAttribute(id, 'searchAttributes')}
                                    />
                                  ))}
                                </SortableContext>
                              ) : (
                                <Box
                                  sx={{
                                    textAlign: 'center',
                                    py: 4,
                                    color: 'text.secondary',
                                  }}
                                >
                                  <Typography variant="body2">
                                    Kéo thả thuộc tính từ bên trái vào đây
                                  </Typography>
                                </Box>
                              )}
                            </EditorDropZone>
                            {errors.searchAttributes && (
                              <Alert severity="error" sx={{ mt: 2 }}>
                                {errors.searchAttributes}
                              </Alert>
                            )}
                          </CardContent>
                        </Card>
                      </Grid>
                    )}

                    {/* Display Attributes Editor - Chỉ hiển thị khi templateType là 'data' */}
                    {formData.templateType === 'data' && (
                      <Grid item xs={12}>
                        <Card>
                          <CardContent sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
                            <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                              Thuộc tính hiển thị
                            </Typography>
                            <EditorDropZone
                              type="displayAttributes"
                              label="Kéo thả thuộc tính vào đây để hiển thị (kéo thả để sắp xếp thứ tự)"
                            >
                              {formData.displayAttributes.length > 0 ? (
                                <SortableContext
                                  items={formData.displayAttributes.map((attr) => attr.id)}
                                  strategy={verticalListSortingStrategy}
                                >
                                  {formData.displayAttributes.map((attribute, index) => (
                                    <SortableAttributeItem
                                      key={attribute.id}
                                      attribute={attribute}
                                      index={index}
                                      onRemove={(id) => handleRemoveAttribute(id, 'displayAttributes')}
                                    />
                                  ))}
                                </SortableContext>
                              ) : (
                                <Box
                                  sx={{
                                    textAlign: 'center',
                                    py: 4,
                                    color: 'text.secondary',
                                  }}
                                >
                                  <Typography variant="body2">
                                    Kéo thả thuộc tính từ bên trái vào đây
                                  </Typography>
                                </Box>
                              )}
                            </EditorDropZone>
                            {errors.displayAttributes && (
                              <Alert severity="error" sx={{ mt: 2 }}>
                                {errors.displayAttributes}
                              </Alert>
                            )}
                          </CardContent>
                        </Card>
                      </Grid>
                    )}
                  </Grid>
                </Grid>
              </Grid>

              <DragOverlay>
                {activeId ? (
                  <Paper
                    sx={{
                      p: 2,
                      bgcolor: 'background.paper',
                      boxShadow: 3,
                      transform: 'rotate(5deg)',
                    }}
                  >
                    <Typography variant="body2" fontWeight={600}>
                      {attributes.find((attr) => `source-${attr.id}` === activeId)?.name ||
                        formData.searchAttributes.find((attr) => attr.id === activeId)?.name ||
                        formData.displayAttributes.find((attr) => attr.id === activeId)?.name}
                    </Typography>
                  </Paper>
                ) : null}
              </DragOverlay>
            </DndContext>
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

      {/* Preview Dialog */}
      <Dialog open={!!previewTemplate} onClose={() => setPreviewTemplate(null)} maxWidth="md" fullWidth>
        <DialogTitle>Preview Template: {previewTemplate?.name}</DialogTitle>
        <DialogContent>
          {previewTemplate && (
            <Box sx={{ pt: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {previewTemplate.description || 'Không có mô tả'}
              </Typography>
              <Box sx={{ mt: 3 }}>
                {previewTemplate.templateType === 'information' ? (
                  <>
                    <Typography variant="subtitle1" gutterBottom fontWeight={600}>
                      Thuộc tính tìm kiếm:
                    </Typography>
                    {previewTemplate.searchAttributes?.length > 0 ? (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {previewTemplate.searchAttributes.map((attr, index) => (
                          <Paper key={attr.id} sx={{ p: 1.5 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Chip label={index + 1} size="small" color="primary" />
                              <Typography variant="body2" fontWeight={600}>
                                {attr.name}
                              </Typography>
                              <Chip label={attr.type} size="small" variant="outlined" />
                            </Box>
                          </Paper>
                        ))}
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Không có thuộc tính tìm kiếm
                      </Typography>
                    )}
                  </>
                ) : (
                  <>
                    <Typography variant="subtitle1" gutterBottom fontWeight={600}>
                      Thuộc tính hiển thị (theo thứ tự):
                    </Typography>
                    {previewTemplate.displayAttributes?.length > 0 ? (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {previewTemplate.displayAttributes.map((attr, index) => (
                          <Paper key={attr.id} sx={{ p: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Chip label={index + 1} size="small" color="primary" />
                              <Typography variant="body2" fontWeight={600}>
                                {attr.name}
                              </Typography>
                              <Chip label={attr.type} size="small" variant="outlined" />
                            </Box>
                          </Paper>
                        ))}
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Không có thuộc tính hiển thị
                      </Typography>
                    )}
                  </>
                )}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewTemplate(null)}>Đóng</Button>
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

export default Templates

