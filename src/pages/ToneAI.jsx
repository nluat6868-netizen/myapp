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
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Select,
  MenuItem,
  InputLabel,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Divider,
  Avatar,
  Checkbox,
  ListItemText,
  OutlinedInput,
  FormHelperText,
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  CheckCircle as CheckCircleIcon,
  Person as PersonIcon,
  PersonAdd as PersonAddIcon,
} from '@mui/icons-material'
import Toast from '../components/Toast'

// Preset tones
const presetTones = [
  {
    id: 'preset-1',
    name: 'Nhẹ nhàng',
    style: ['Nhẹ nhàng'],
    formality: 'Thân thiện',
    addressing: 'Bạn',
    description: 'Phong cách giao tiếp nhẹ nhàng, dễ chịu',
    isPreset: true,
  },
  {
    id: 'preset-2',
    name: 'Lịch sự',
    style: ['Lịch sự', 'Chuyên nghiệp'],
    formality: 'Trang trọng',
    addressing: 'Anh/Chị',
    description: 'Phong cách lịch sự, trang trọng, chuyên nghiệp',
    isPreset: true,
  },
  {
    id: 'preset-3',
    name: 'Thân thiện',
    style: ['Thân thiện', 'Vui vẻ'],
    formality: 'Thân thiện',
    addressing: 'Bạn',
    description: 'Phong cách thân thiện, gần gũi',
    isPreset: true,
  },
  {
    id: 'preset-4',
    name: 'Chuyên nghiệp',
    style: ['Chuyên nghiệp', 'Nghiêm túc'],
    formality: 'Trang trọng',
    addressing: 'Anh/Chị',
    description: 'Phong cách chuyên nghiệp, nghiêm túc',
    isPreset: true,
  },
]

const styleOptions = [
  'Nhẹ nhàng',
  'Lịch sự',
  'Thân thiện',
  'Chuyên nghiệp',
  'Vui vẻ',
  'Nghiêm túc',
  'Cởi mở',
  'Nhiệt tình',
  'Tự tin',
  'Chân thành',
]

function ToneAI() {
  const dispatch = useDispatch()
  const { tones: apiTones, loading: tonesLoading } = useSelector((state) => state.tones)

  // Load and normalize custom tones (convert old string style to array)
  const loadCustomTones = () => {
    try {
      const saved = JSON.parse(localStorage.getItem('customTones') || '[]')
      return saved.map((tone) => ({
        ...tone,
        style: Array.isArray(tone.style) ? tone.style : tone.style ? [tone.style] : [],
      }))
    } catch (error) {
      console.error('Error loading custom tones:', error)
      return []
    }
  }

  const [customTones, setCustomTones] = useState(loadCustomTones())

  // Load tones from API on mount and when tones are updated
  useEffect(() => {
    dispatch({ type: 'GET_TONES_REQUEST' })
  }, [dispatch])

  // Convert API tones to custom tones format
  const apiTonesFormatted = (apiTones || []).map((tone) => ({
    id: `api-${tone._id || tone.id}`,
    name: tone.name,
    description: tone.description || '',
    style: tone.style || [],
    formality: tone.formality || 'Thân thiện',
    addressing: tone.addressing || 'Bạn',
    isPreset: false,
    isFromAPI: true,
    _id: tone._id || tone.id,
  }))
  const [selectedTone, setSelectedTone] = useState(
    localStorage.getItem('selectedTone') || 'preset-1'
  )
  const [selectedStaff, setSelectedStaff] = useState(
    localStorage.getItem('selectedStaff') || null
  )
  const [staffMembers, setStaffMembers] = useState(
    JSON.parse(localStorage.getItem('staffMembers') || '[]')
  )
  const [openDialog, setOpenDialog] = useState(false)
  const [openStaffDialog, setOpenStaffDialog] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editingStaffId, setEditingStaffId] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    style: [],
    formality: '',
    addressing: '',
    description: '',
  })
  const [staffFormData, setStaffFormData] = useState({
    name: '',
    toneId: selectedTone,
  })
  const [errors, setErrors] = useState({})
  const [staffErrors, setStaffErrors] = useState({})
  const [toast, setToast] = useState({ open: false, message: '', severity: 'info' })

  // Combine all tones together (preset, API, and custom) - all in "Tone có sẵn"
  const allTones = [...presetTones, ...apiTonesFormatted, ...customTones]

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    // Clear error
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }))
    }
  }

  const handleStyleChange = (event) => {
    const {
      target: { value },
    } = event
    // On autofill we get a stringified value.
    const newValue = typeof value === 'string' ? value.split(',') : value
    setFormData((prev) => ({
      ...prev,
      style: newValue,
    }))
    if (errors.style) {
      setErrors((prev) => ({
        ...prev,
        style: '',
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Tên tone không được để trống'
    }

    if (!formData.style || formData.style.length === 0) {
      newErrors.style = 'Vui lòng chọn ít nhất một phong cách'
    }

    if (!formData.formality) {
      newErrors.formality = 'Vui lòng chọn mức độ lịch sự'
    }

    if (!formData.addressing) {
      newErrors.addressing = 'Vui lòng chọn cách xưng hô'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleOpenDialog = (tone = null) => {
    if (tone && !tone.isPreset) {
      setEditingId(tone.id)
      setFormData({
        name: tone.name,
        style: Array.isArray(tone.style) ? tone.style : [tone.style].filter(Boolean),
        formality: tone.formality,
        addressing: tone.addressing,
        description: tone.description || '',
      })
    } else {
      setEditingId(null)
      setFormData({
        name: '',
        style: [],
        formality: '',
        addressing: '',
        description: '',
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
      style: [],
      formality: '',
      addressing: '',
      description: '',
    })
    setErrors({})
  }

  const handleSave = () => {
    if (!validateForm()) return

    if (editingId) {
      // Update existing custom tone
      setCustomTones((prev) =>
        prev.map((tone) =>
          tone.id === editingId
            ? {
                ...tone,
                name: formData.name,
                style: formData.style,
                formality: formData.formality,
                addressing: formData.addressing,
                description: formData.description,
              }
            : tone
        )
      )
      setToast({
        open: true,
        message: 'Cập nhật tone thành công!',
        severity: 'success',
      })
    } else {
      // Add new custom tone
      const newTone = {
        id: `custom-${Date.now()}`,
        name: formData.name,
        style: formData.style,
        formality: formData.formality,
        addressing: formData.addressing,
        description: formData.description,
        isPreset: false,
      }
      setCustomTones((prev) => [...prev, newTone])
      setToast({
        open: true,
        message: 'Tạo tone mới thành công!',
        severity: 'success',
      })
    }

    handleCloseDialog()
    setTimeout(() => setToast({ ...toast, open: false }), 3000)
  }

  const handleDelete = (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tone này?')) {
      setCustomTones((prev) => prev.filter((tone) => tone.id !== id))
      if (selectedTone === id) {
        setSelectedTone('preset-1')
        localStorage.setItem('selectedTone', 'preset-1')
      }
      setToast({
        open: true,
        message: 'Xóa tone thành công!',
        severity: 'success',
      })
      setTimeout(() => setToast({ ...toast, open: false }), 3000)
    }
  }

  const handleSelectTone = (toneId) => {
    setSelectedTone(toneId)
    localStorage.setItem('selectedTone', toneId)
    // Reset selected staff if it doesn't belong to the new tone
    const staff = staffMembers.find((s) => s.id === selectedStaff)
    if (staff && staff.toneId !== toneId) {
      setSelectedStaff(null)
      localStorage.removeItem('selectedStaff')
    }
    setToast({
      open: true,
      message: 'Đã chọn tone thành công!',
      severity: 'success',
    })
    setTimeout(() => setToast({ ...toast, open: false }), 3000)
  }

  const handleSelectStaff = (staffId) => {
    setSelectedStaff(staffId)
    localStorage.setItem('selectedStaff', staffId)
    const staff = staffMembers.find((s) => s.id === staffId)
    setToast({
      open: true,
      message: `Đã chọn nhân viên "${staff?.name || ''}" thành công!`,
      severity: 'success',
    })
    setTimeout(() => setToast({ ...toast, open: false }), 3000)
  }

  const handleOpenStaffDialog = (staff = null) => {
    if (staff) {
      setEditingStaffId(staff.id)
      setStaffFormData({
        name: staff.name,
        toneId: staff.toneId,
      })
    } else {
      setEditingStaffId(null)
      setStaffFormData({
        name: '',
        toneId: selectedTone, // Tự động gán tone đang được chọn
      })
    }
    setStaffErrors({})
    setOpenStaffDialog(true)
  }

  const handleCloseStaffDialog = () => {
    setOpenStaffDialog(false)
    setEditingStaffId(null)
    setStaffFormData({
      name: '',
      toneId: selectedTone,
    })
    setStaffErrors({})
  }

  const validateStaffForm = () => {
    const newErrors = {}

    if (!staffFormData.name.trim()) {
      newErrors.name = 'Tên nhân viên không được để trống'
    }

    // Khi thêm mới, tự động dùng tone đang chọn
    const toneIdToUse = editingStaffId ? staffFormData.toneId : selectedTone

    if (!toneIdToUse) {
      newErrors.toneId = 'Vui lòng chọn tone'
    }

    // Check for duplicate name in the same tone
    const existingStaff = staffMembers.find(
      (s) =>
        s.name.toLowerCase() === staffFormData.name.toLowerCase().trim() &&
        s.toneId === toneIdToUse &&
        s.id !== editingStaffId
    )
    if (existingStaff) {
      newErrors.name = 'Tên nhân viên đã tồn tại cho tone này'
    }

    setStaffErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSaveStaff = () => {
    if (!validateStaffForm()) return

    // Khi thêm mới, tự động dùng tone đang chọn
    const toneIdToUse = editingStaffId ? staffFormData.toneId : selectedTone

    if (editingStaffId) {
      // Update existing staff
      setStaffMembers((prev) =>
        prev.map((staff) =>
          staff.id === editingStaffId
            ? {
                ...staff,
                name: staffFormData.name.trim(),
                toneId: toneIdToUse,
              }
            : staff
        )
      )
      setToast({
        open: true,
        message: 'Cập nhật nhân viên thành công!',
        severity: 'success',
      })
    } else {
      // Add new staff - tự động gán tone đang chọn
      const newStaff = {
        id: `staff-${Date.now()}`,
        name: staffFormData.name.trim(),
        toneId: toneIdToUse,
        createdAt: new Date().toISOString(),
      }
      setStaffMembers((prev) => [...prev, newStaff])
      setToast({
        open: true,
        message: `Thêm nhân viên "${newStaff.name}" cho tone "${allTones.find((t) => t.id === toneIdToUse)?.name || ''}" thành công!`,
        severity: 'success',
      })
    }

    handleCloseStaffDialog()
    setTimeout(() => setToast({ ...toast, open: false }), 3000)
  }

  const handleDeleteStaff = (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa nhân viên này?')) {
      setStaffMembers((prev) => prev.filter((staff) => staff.id !== id))
      // Reset selected staff if deleted
      if (selectedStaff === id) {
        setSelectedStaff(null)
        localStorage.removeItem('selectedStaff')
      }
      setToast({
        open: true,
        message: 'Xóa nhân viên thành công!',
        severity: 'success',
      })
      setTimeout(() => setToast({ ...toast, open: false }), 3000)
    }
  }

  const handleStaffInputChange = (e) => {
    const { name, value } = e.target
    setStaffFormData((prev) => ({ ...prev, [name]: value }))
    if (staffErrors[name]) {
      setStaffErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  // Get staff members for selected tone
  const selectedToneStaff = staffMembers.filter((staff) => staff.toneId === selectedTone)
  const selectedStaffData = staffMembers.find((s) => s.id === selectedStaff)

  // Save custom tones to localStorage whenever they change
  useEffect(() => {
    try {
      // Ensure style is always an array before saving
      const normalizedTones = customTones.map((tone) => ({
        ...tone,
        style: Array.isArray(tone.style) ? tone.style : tone.style ? [tone.style] : [],
      }))
      localStorage.setItem('customTones', JSON.stringify(normalizedTones))
    } catch (error) {
      console.error('Error saving custom tones:', error)
    }
  }, [customTones])

  // Save staff members to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('staffMembers', JSON.stringify(staffMembers))
  }, [staffMembers])

  // Update staffFormData when selectedTone changes
  useEffect(() => {
    if (!openStaffDialog) {
      setStaffFormData((prev) => ({ ...prev, toneId: selectedTone }))
    }
  }, [selectedTone, openStaffDialog])

  const selectedToneData = allTones.find((t) => t.id === selectedTone)

  return (
    <Container maxWidth="xl" sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
          Tone AI
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Quản lý và tùy chỉnh tone giao tiếp cho AI
        </Typography>
      </Box>

      {/* Selected Tone Display */}
      {selectedToneData && (
        <Card sx={{ mb: 3, bgcolor: 'primary.main', color: 'white' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" gutterBottom>
                  Tone đang sử dụng: {selectedToneData.name}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  {selectedToneData.description}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap' }}>
                  {Array.isArray(selectedToneData.style)
                    ? selectedToneData.style.map((style, index) => (
                        <Chip
                          key={index}
                          label={style}
                          size="small"
                          sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}
                        />
                      ))
                    : (
                        <Chip
                          label={selectedToneData.style}
                          size="small"
                          sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}
                        />
                      )}
                  <Chip label={selectedToneData.formality} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} />
                  <Chip label={selectedToneData.addressing} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} />
                </Box>
              </Box>
              <CheckCircleIcon sx={{ fontSize: 48, opacity: 0.3 }} />
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Selected Staff Display */}
      {selectedStaffData && selectedStaffData.toneId === selectedTone && (
        <Card sx={{ mb: 3, bgcolor: 'success.light', border: '2px solid', borderColor: 'success.main' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                <Avatar sx={{ bgcolor: 'success.main', width: 56, height: 56, fontSize: '1.5rem' }}>
                  {selectedStaffData.name.charAt(0).toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Nhân viên đang sử dụng: {selectedStaffData.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Tone: {allTones.find((t) => t.id === selectedStaffData.toneId)?.name || 'N/A'}
                  </Typography>
                </Box>
              </Box>
              <CheckCircleIcon sx={{ fontSize: 48, color: 'success.main', opacity: 0.3 }} />
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Staff Members Section */}
      {selectedToneData && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PersonIcon color="primary" />
                <Box>
                  <Typography variant="h6" fontWeight={600}>
                    Nhân viên tư vấn
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Tone: {selectedToneData.name}
                  </Typography>
                </Box>
              </Box>
              <Button
                variant="contained"
                size="small"
                startIcon={<PersonAddIcon />}
                onClick={() => handleOpenStaffDialog()}
              >
                Thêm nhân viên cho tone này
              </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />
            {selectedToneStaff.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <PersonIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Chưa có nhân viên tư vấn nào cho tone "{selectedToneData.name}"
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<PersonAddIcon />}
                  onClick={() => handleOpenStaffDialog()}
                  sx={{ mt: 2 }}
                >
                  Thêm nhân viên đầu tiên
                </Button>
              </Box>
            ) : (
              <>
                <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip
                    label={`${selectedToneStaff.length} nhân viên`}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                  <Typography variant="caption" color="text.secondary">
                    Tất cả nhân viên đều sử dụng tone "{selectedToneData.name}"
                  </Typography>
                </Box>
                <Grid container spacing={2}>
                  {selectedToneStaff.map((staff) => {
                    const isSelected = selectedStaff === staff.id
                    return (
                      <Grid item xs={12} sm={6} md={4} key={staff.id}>
                        <Card
                          variant="outlined"
                          onClick={() => handleSelectStaff(staff.id)}
                          sx={{
                            p: 2,
                            cursor: 'pointer',
                            border: isSelected ? '2px solid' : '1px solid',
                            borderColor: isSelected ? 'success.main' : 'divider',
                            bgcolor: isSelected ? 'success.lighter' : 'background.paper',
                            '&:hover': {
                              boxShadow: 2,
                              borderColor: isSelected ? 'success.main' : 'primary.main',
                            },
                          }}
                        >
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1 }}>
                              <Avatar
                                sx={{
                                  bgcolor: isSelected ? 'success.main' : 'primary.main',
                                  width: 40,
                                  height: 40,
                                }}
                              >
                                {staff.name.charAt(0).toUpperCase()}
                              </Avatar>
                              <Box sx={{ flex: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Typography variant="subtitle1" fontWeight={600}>
                                    {staff.name}
                                  </Typography>
                                  {isSelected && (
                                    <CheckCircleIcon
                                      sx={{ fontSize: 18, color: 'success.main', verticalAlign: 'middle' }}
                                    />
                                  )}
                                </Box>
                                <Typography variant="caption" color="text.secondary">
                                  Tone: {selectedToneData.name}
                                </Typography>
                              </Box>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 0.5 }} onClick={(e) => e.stopPropagation()}>
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleOpenStaffDialog(staff)}
                                title="Chỉnh sửa"
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDeleteStaff(staff.id)}
                                title="Xóa"
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          </Box>
                        </Card>
                      </Grid>
                    )
                  })}
                </Grid>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Action Button */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Tạo Tone Custom
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* All Tones (Preset, API, and Custom) */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Tone có sẵn
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {allTones.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    Chưa có tone nào. Hãy tạo tone mới hoặc tạo từ Quick Bot Setup!
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {allTones.map((tone) => (
                  <Card
                    key={tone.id}
                    variant="outlined"
                    sx={{
                      p: 2,
                      cursor: 'pointer',
                      border: selectedTone === tone.id ? '2px solid' : '1px solid',
                      borderColor: selectedTone === tone.id ? 'primary.main' : 'divider',
                      bgcolor: selectedTone === tone.id ? 'action.selected' : 'background.paper',
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                    }}
                    onClick={() => handleSelectTone(tone.id)}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle1" fontWeight={600}>
                          {tone.name}
                          {selectedTone === tone.id && (
                            <CheckCircleIcon
                              sx={{ fontSize: 18, color: 'primary.main', ml: 1, verticalAlign: 'middle' }}
                            />
                          )}
                          {tone.isPreset && (
                            <Chip label="Mặc định" size="small" sx={{ ml: 1 }} />
                          )}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          {tone.description || 'Không có mô tả'}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                          {Array.isArray(tone.style) && tone.style.length > 0
                            ? tone.style.map((style, index) => (
                                <Chip key={index} label={style} size="small" />
                              ))
                            : tone.style ? (
                                <Chip label={tone.style} size="small" />
                              ) : null}
                          {tone.formality && <Chip label={tone.formality} size="small" />}
                          {tone.addressing && <Chip label={tone.addressing} size="small" />}
                        </Box>
                      </Box>
                      {!tone.isPreset && (
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleOpenDialog(tone)
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDelete(tone.id)
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      )}
                    </Box>
                  </Card>
                ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Create/Edit Staff Dialog */}
      <Dialog
        open={openStaffDialog}
        onClose={handleCloseStaffDialog}
        maxWidth="sm"
        fullWidth
        fullScreen={window.innerWidth < 600}
        sx={{
          '& .MuiDialog-paper': {
            m: { xs: 0, sm: 2 },
            maxHeight: { xs: '100vh', sm: '90vh' },
          },
        }}
      >
        <DialogTitle>
          {editingStaffId ? 'Chỉnh sửa nhân viên tư vấn' : 'Thêm nhân viên tư vấn'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Tên nhân viên tư vấn *"
              name="name"
              value={staffFormData.name}
              onChange={handleStaffInputChange}
              error={!!staffErrors.name}
              helperText={staffErrors.name}
              required
              sx={{ mb: 3 }}
              placeholder="VD: Nguyễn Văn A, Trần Thị B..."
            />

            {editingStaffId ? (
              <FormControl fullWidth error={!!staffErrors.toneId} required>
                <InputLabel>Tone</InputLabel>
                <Select
                  name="toneId"
                  value={staffFormData.toneId}
                  onChange={handleStaffInputChange}
                  label="Tone"
                >
                  {allTones.map((tone) => (
                    <MenuItem key={tone.id} value={tone.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                        <Box sx={{ flex: 1 }}>{tone.name}</Box>
                        {tone.id === selectedTone && (
                          <Chip label="Đang chọn" size="small" color="primary" sx={{ height: 20 }} />
                        )}
                        {tone.isPreset && (
                          <Chip label="Mặc định" size="small" sx={{ height: 20 }} />
                        )}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
                {staffErrors.toneId && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                    {staffErrors.toneId}
                  </Typography>
                )}
                <FormHelperText>
                  Chọn tone mà nhân viên này sẽ sử dụng khi tư vấn
                </FormHelperText>
              </FormControl>
            ) : (
              <Box
                sx={{
                  p: 2,
                  borderRadius: 1,
                  bgcolor: 'action.selected',
                  border: '1px solid',
                  borderColor: 'divider',
                  mb: 3,
                }}
              >
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Tone sẽ được gán tự động
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                  <Chip
                    label={allTones.find((t) => t.id === selectedTone)?.name || 'N/A'}
                    color="primary"
                    size="small"
                  />
                  <Typography variant="body2" fontWeight={500}>
                    (Tone đang chọn)
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseStaffDialog} startIcon={<CancelIcon />}>
            Hủy
          </Button>
          <Button onClick={handleSaveStaff} variant="contained" startIcon={<SaveIcon />}>
            Lưu
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create/Edit Tone Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        fullScreen={window.innerWidth < 600}
        sx={{
          '& .MuiDialog-paper': {
            m: { xs: 0, sm: 2 },
            maxHeight: { xs: '100vh', sm: '90vh' },
          },
        }}
      >
        <DialogTitle>{editingId ? 'Chỉnh sửa Tone' : 'Tạo Tone Custom'}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Tên tone"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              error={!!errors.name}
              helperText={errors.name}
              required
              sx={{ mb: 3 }}
            />

            <FormControl fullWidth sx={{ mb: 3 }} error={!!errors.style} required>
              <InputLabel>Phong cách (có thể chọn nhiều)</InputLabel>
              <Select
                multiple
                value={formData.style}
                onChange={handleStyleChange}
                input={<OutlinedInput label="Phong cách (có thể chọn nhiều)" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} size="small" />
                    ))}
                  </Box>
                )}
              >
                {styleOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    <Checkbox checked={formData.style.indexOf(option) > -1} />
                    <ListItemText primary={option} />
                  </MenuItem>
                ))}
              </Select>
              {errors.style && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                  {errors.style}
                </Typography>
              )}
              {!errors.style && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, ml: 1.5 }}>
                  Có thể chọn nhiều phong cách cho tone này
                </Typography>
              )}
            </FormControl>

            <FormControl fullWidth sx={{ mb: 3 }} error={!!errors.formality} required>
              <InputLabel>Mức độ lịch sự</InputLabel>
              <Select
                name="formality"
                value={formData.formality}
                onChange={handleInputChange}
                label="Mức độ lịch sự"
              >
                <MenuItem value="Thân thiện">Thân thiện</MenuItem>
                <MenuItem value="Trang trọng">Trang trọng</MenuItem>
                <MenuItem value="Rất trang trọng">Rất trang trọng</MenuItem>
                <MenuItem value="Thoải mái">Thoải mái</MenuItem>
              </Select>
              {errors.formality && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                  {errors.formality}
                </Typography>
              )}
            </FormControl>

            <FormControl fullWidth sx={{ mb: 3 }} error={!!errors.addressing} required>
              <InputLabel>Cách xưng hô</InputLabel>
              <Select
                name="addressing"
                value={formData.addressing}
                onChange={handleInputChange}
                label="Cách xưng hô"
              >
                <MenuItem value="Bạn">Bạn</MenuItem>
                <MenuItem value="Anh/Chị">Anh/Chị</MenuItem>
                <MenuItem value="Em">Em</MenuItem>
                <MenuItem value="Ông/Bà">Ông/Bà</MenuItem>
                <MenuItem value="Không xưng hô">Không xưng hô</MenuItem>
              </Select>
              {errors.addressing && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                  {errors.addressing}
                </Typography>
              )}
            </FormControl>

            <TextField
              fullWidth
              label="Mô tả (tùy chọn)"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              multiline
              rows={3}
            />
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

export default ToneAI

