import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import {
  Container,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  TextField,
  Autocomplete,
  Grid,
  Paper,
  IconButton,
  Chip,
  CircularProgress,
  Alert,
  Divider,
  Checkbox,
} from '@mui/material'
import {
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  CheckCircle as CheckCircleIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  DeleteSweep as DeleteSweepIcon,
} from '@mui/icons-material'
import Toast from '../components/Toast'

// Sample industries
const industries = [
  'Thời trang',
  'Điện tử',
  'Thực phẩm & Đồ uống',
  'Mỹ phẩm',
  'Nội thất',
  'Sách & Văn phòng phẩm',
  'Đồ chơi',
  'Thể thao',
  'Y tế & Sức khỏe',
  'Ô tô & Xe máy',
  'Bất động sản',
  'Giáo dục',
  'Du lịch',
  'Nhà hàng & Khách sạn',
  'Khác',
]

const steps = [
  'Chọn ngành hàng',
  'FAQs mẫu',
  'Dữ liệu sản phẩm mẫu',
  'Tone AI mẫu',
  'Hoàn thành',
]

function QuickBotSetup() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [activeStep, setActiveStep] = useState(0)
  const [selectedIndustry, setSelectedIndustry] = useState(null)
  const [generatedFAQs, setGeneratedFAQs] = useState([])
  const [generatedProducts, setGeneratedProducts] = useState([])
  const [generatedTones, setGeneratedTones] = useState([])
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState({ open: false, message: '', severity: 'info' })
  const [editingFAQ, setEditingFAQ] = useState(null)
  const [editingProduct, setEditingProduct] = useState(null)
  const [editingTone, setEditingTone] = useState(null)
  const [selectedTones, setSelectedTones] = useState([]) // Selected tones from existing list
  const [selectedFAQs, setSelectedFAQs] = useState([]) // Selected FAQs for bulk actions
  
  // Get existing data from Redux
  const { faqs: existingFAQs, loading: faqsLoading } = useSelector((state) => state.faqs)
  const { tones: existingTones, loading: tonesLoading } = useSelector((state) => state.tones)
  const { products: existingProducts, loading: productsLoading } = useSelector((state) => state.products)
  const { attributes: existingAttributes } = useSelector((state) => state.productAttributes)

  // Load existing data on mount
  useEffect(() => {
    dispatch({ type: 'GET_FAQS_REQUEST' })
    dispatch({ type: 'GET_TONES_REQUEST' })
    dispatch({ type: 'GET_PRODUCTS_REQUEST' })
    dispatch({ type: 'GET_ATTRIBUTES_REQUEST' })
    
    // Load last setup from localStorage if exists
    const lastSetup = localStorage.getItem('lastBotSetup')
    if (lastSetup) {
      try {
        const setup = JSON.parse(lastSetup)
        if (setup.industry) {
          setSelectedIndustry(setup.industry)
        }
        if (setup.faqs && setup.faqs.length > 0) {
          setGeneratedFAQs(setup.faqs)
        }
        if (setup.products && setup.products.length > 0) {
          setGeneratedProducts(setup.products)
        }
        if (setup.tones && setup.tones.length > 0) {
          // Separate selected tones (with _id) and new tones
          const selected = setup.tones.filter(t => t._id)
          const newTones = setup.tones.filter(t => !t._id)
          setSelectedTones(selected)
          setGeneratedTones(newTones)
        }
      } catch (error) {
        console.error('Error loading last setup:', error)
      }
    }
  }, [dispatch])

  // Update generated data when existing data is loaded (only if no last setup)
  useEffect(() => {
    const lastSetup = localStorage.getItem('lastBotSetup')
    if (lastSetup) return // Don't override if we have a saved setup
    
    if (existingFAQs && existingFAQs.length > 0 && generatedFAQs.length === 0) {
      setGeneratedFAQs(existingFAQs.map(faq => ({
        question: faq.question,
        answer: faq.answer,
        _id: faq._id,
      })))
    }
  }, [existingFAQs, generatedFAQs.length])

  useEffect(() => {
    const lastSetup = localStorage.getItem('lastBotSetup')
    if (lastSetup) return // Don't override if we have a saved setup
    
    if (existingTones && existingTones.length > 0 && generatedTones.length === 0 && selectedTones.length === 0) {
      // Don't auto-load tones, let user choose
    }
  }, [existingTones, generatedTones.length, selectedTones.length])

  useEffect(() => {
    const lastSetup = localStorage.getItem('lastBotSetup')
    if (lastSetup) return // Don't override if we have a saved setup
    
    if (existingProducts && existingProducts.length > 0 && generatedProducts.length === 0) {
      // Convert products to simple format for display
      setGeneratedProducts(existingProducts.slice(0, 10).map(product => {
        const attrs = product.attributes || {}
        return {
          name: attrs.name || product.name || 'Sản phẩm',
          price: attrs.price || attrs.gia || '0',
          description: attrs.description || attrs.moTa || '',
          _id: product._id,
        }
      }))
    }
  }, [existingProducts, generatedProducts.length])

  // Generate sample data for selected industry only
  const generateSampleData = async (selectedIndustry) => {
    if (!selectedIndustry) {
      setToast({
        open: true,
        message: 'Vui lòng chọn ngành hàng',
        severity: 'warning',
      })
      return
    }

    setLoading(true)
    try {
      // Generate data ONLY for the selected industry
      const faqs = generateFAQs(selectedIndustry)
      const products = generateProducts(selectedIndustry)
      const tones = generateTones(selectedIndustry)

      setGeneratedFAQs(faqs)
      setGeneratedProducts(products)
      setGeneratedTones(tones)

      setToast({
        open: true,
        message: `Đã tạo dữ liệu mẫu thành công cho ngành hàng "${selectedIndustry}"!`,
        severity: 'success',
      })
    } catch (error) {
      setToast({
        open: true,
        message: 'Có lỗi xảy ra khi tạo dữ liệu mẫu',
        severity: 'error',
      })
    } finally {
      setLoading(false)
    }
  }

  const generateFAQs = (industry) => {
    const industryFAQs = {
      'Thời trang': [
        { question: 'Kích thước sản phẩm như thế nào?', answer: 'Chúng tôi có đầy đủ các size từ S đến XXL. Bạn có thể tham khảo bảng size trong mô tả sản phẩm.' },
        { question: 'Chất liệu vải là gì?', answer: 'Sản phẩm được làm từ chất liệu cao cấp, mềm mại và thoáng khí, đảm bảo sự thoải mái khi mặc.' },
        { question: 'Có thể đổi trả không?', answer: 'Chúng tôi hỗ trợ đổi trả trong vòng 7 ngày kể từ ngày nhận hàng với điều kiện sản phẩm còn nguyên vẹn, chưa sử dụng.' },
        { question: 'Thời gian giao hàng là bao lâu?', answer: 'Thời gian giao hàng từ 2-5 ngày làm việc tùy theo khu vực. Với đơn hàng trên 500.000đ sẽ được miễn phí vận chuyển.' },
        { question: 'Có chương trình khuyến mãi không?', answer: 'Chúng tôi thường xuyên có các chương trình khuyến mãi, giảm giá cho khách hàng. Hãy theo dõi trang web để cập nhật thông tin mới nhất.' },
      ],
      'Điện tử': [
        { question: 'Sản phẩm có bảo hành không?', answer: 'Tất cả sản phẩm điện tử đều có bảo hành chính hãng từ 12-24 tháng tùy theo sản phẩm. Bạn sẽ nhận được phiếu bảo hành khi mua hàng.' },
        { question: 'Có hỗ trợ cài đặt không?', answer: 'Chúng tôi có đội ngũ kỹ thuật hỗ trợ cài đặt và hướng dẫn sử dụng sản phẩm miễn phí.' },
        { question: 'Sản phẩm có phải hàng chính hãng không?', answer: 'Tất cả sản phẩm đều là hàng chính hãng, có đầy đủ tem nhãn và giấy tờ chứng minh nguồn gốc.' },
        { question: 'Có thể trả góp không?', answer: 'Chúng tôi hỗ trợ trả góp 0% lãi suất qua các ngân hàng đối tác. Vui lòng liên hệ để biết thêm chi tiết.' },
        { question: 'Chính sách đổi trả như thế nào?', answer: 'Sản phẩm có thể đổi trả trong vòng 7 ngày nếu có lỗi từ nhà sản xuất hoặc không đúng mô tả.' },
      ],
      'Thực phẩm & Đồ uống': [
        { question: 'Sản phẩm có đảm bảo an toàn vệ sinh không?', answer: 'Tất cả sản phẩm đều được kiểm định chất lượng, có giấy chứng nhận an toàn thực phẩm và hạn sử dụng rõ ràng.' },
        { question: 'Có giao hàng tươi sống không?', answer: 'Chúng tôi có dịch vụ giao hàng tươi sống với phương tiện bảo quản lạnh đảm bảo chất lượng sản phẩm.' },
        { question: 'Hạn sử dụng còn bao lâu?', answer: 'Tất cả sản phẩm đều có hạn sử dụng còn ít nhất 70% thời gian so với hạn sử dụng gốc.' },
        { question: 'Có chương trình tích điểm không?', answer: 'Khách hàng sẽ được tích điểm cho mỗi đơn hàng, điểm có thể quy đổi thành voucher giảm giá cho lần mua sau.' },
        { question: 'Có thể đặt hàng số lượng lớn không?', answer: 'Chúng tôi có chính sách giá ưu đãi cho đơn hàng số lượng lớn. Vui lòng liên hệ để được báo giá tốt nhất.' },
      ],
      'Mỹ phẩm': [
        { question: 'Sản phẩm có nguồn gốc từ đâu?', answer: 'Tất cả sản phẩm mỹ phẩm đều được nhập khẩu chính hãng, có đầy đủ giấy tờ chứng minh nguồn gốc và được Bộ Y tế cấp phép lưu hành.' },
        { question: 'Có phù hợp với da nhạy cảm không?', answer: 'Chúng tôi có các dòng sản phẩm dành riêng cho da nhạy cảm, đã được kiểm nghiệm và chứng nhận an toàn.' },
        { question: 'Có thể test thử sản phẩm không?', answer: 'Chúng tôi có chính sách đổi trả trong 7 ngày nếu sản phẩm không phù hợp với làn da của bạn.' },
        { question: 'Hạn sử dụng còn bao lâu?', answer: 'Tất cả sản phẩm đều có hạn sử dụng còn ít nhất 12 tháng kể từ ngày mua.' },
        { question: 'Có tư vấn về cách sử dụng không?', answer: 'Chúng tôi có đội ngũ chuyên viên tư vấn miễn phí về cách sử dụng và chăm sóc da phù hợp với từng loại sản phẩm.' },
      ],
      'Nội thất': [
        { question: 'Sản phẩm có lắp đặt tại nhà không?', answer: 'Chúng tôi có dịch vụ lắp đặt miễn phí tại nhà cho các sản phẩm nội thất lớn trong khu vực nội thành.' },
        { question: 'Chất liệu sản phẩm là gì?', answer: 'Sản phẩm được làm từ các chất liệu cao cấp như gỗ tự nhiên, gỗ công nghiệp MDF, kim loại cao cấp, đảm bảo độ bền và thẩm mỹ.' },
        { question: 'Có bảo hành sản phẩm không?', answer: 'Tất cả sản phẩm đều có bảo hành từ 12-24 tháng tùy theo loại sản phẩm và chất liệu.' },
        { question: 'Thời gian giao hàng là bao lâu?', answer: 'Thời gian giao hàng từ 7-14 ngày làm việc tùy theo sản phẩm và địa điểm giao hàng.' },
        { question: 'Có thể đặt hàng theo yêu cầu không?', answer: 'Chúng tôi nhận đặt hàng theo yêu cầu với thời gian sản xuất từ 2-4 tuần tùy theo độ phức tạp của sản phẩm.' },
      ],
      'Sách & Văn phòng phẩm': [
        { question: 'Sách có bản quyền không?', answer: 'Tất cả sách đều có bản quyền chính thức, được nhập khẩu hoặc in ấn hợp pháp tại Việt Nam.' },
        { question: 'Có sách điện tử không?', answer: 'Chúng tôi có cả sách in và sách điện tử (ebook) với nhiều định dạng phù hợp với các thiết bị đọc sách.' },
        { question: 'Có chương trình giảm giá cho học sinh, sinh viên không?', answer: 'Chúng tôi có chương trình giảm giá đặc biệt 10-15% cho học sinh, sinh viên khi mua sách giáo khoa và tài liệu học tập.' },
        { question: 'Có thể đặt hàng số lượng lớn không?', answer: 'Chúng tôi có chính sách giá ưu đãi cho đơn hàng số lượng lớn, phù hợp cho trường học, thư viện và các tổ chức giáo dục.' },
        { question: 'Có dịch vụ in ấn tài liệu không?', answer: 'Chúng tôi có dịch vụ in ấn tài liệu với nhiều loại giấy và kích thước khác nhau, phù hợp với nhu cầu của bạn.' },
      ],
      'Đồ chơi': [
        { question: 'Sản phẩm có an toàn cho trẻ em không?', answer: 'Tất cả sản phẩm đồ chơi đều đạt tiêu chuẩn an toàn, có chứng nhận CE và được kiểm định chất lượng.' },
        { question: 'Có phù hợp với độ tuổi nào?', answer: 'Mỗi sản phẩm đều có ghi rõ độ tuổi phù hợp trên bao bì, giúp bạn lựa chọn sản phẩm phù hợp với trẻ.' },
        { question: 'Có bảo hành không?', answer: 'Sản phẩm có bảo hành từ 3-12 tháng tùy theo loại đồ chơi, đảm bảo chất lượng và độ bền.' },
        { question: 'Có thể đổi trả nếu trẻ không thích không?', answer: 'Chúng tôi hỗ trợ đổi trả trong vòng 7 ngày nếu sản phẩm còn nguyên vẹn, chưa sử dụng và có hóa đơn mua hàng.' },
        { question: 'Có chương trình khuyến mãi không?', answer: 'Chúng tôi thường xuyên có các chương trình khuyến mãi đặc biệt vào các dịp lễ tết, giảm giá lên đến 30% cho nhiều sản phẩm.' },
      ],
      'Thể thao': [
        { question: 'Sản phẩm có phù hợp với người mới tập không?', answer: 'Chúng tôi có đầy đủ các sản phẩm từ cơ bản đến chuyên nghiệp, phù hợp với mọi trình độ và nhu cầu tập luyện.' },
        { question: 'Có tư vấn về kích thước không?', answer: 'Chúng tôi có bảng size chi tiết và đội ngũ tư vấn chuyên nghiệp để giúp bạn chọn size phù hợp nhất.' },
        { question: 'Sản phẩm có chống nước không?', answer: 'Nhiều sản phẩm của chúng tôi có tính năng chống nước, phù hợp cho các hoạt động thể thao dưới nước và ngoài trời.' },
        { question: 'Có bảo hành không?', answer: 'Sản phẩm có bảo hành từ 6-24 tháng tùy theo loại sản phẩm, đảm bảo chất lượng và độ bền trong quá trình sử dụng.' },
        { question: 'Có chương trình tích điểm không?', answer: 'Khách hàng sẽ được tích điểm cho mỗi đơn hàng, điểm có thể quy đổi thành voucher giảm giá hoặc sản phẩm miễn phí.' },
      ],
      'Y tế & Sức khỏe': [
        { question: 'Sản phẩm có được Bộ Y tế cấp phép không?', answer: 'Tất cả sản phẩm y tế và sức khỏe đều được Bộ Y tế cấp phép lưu hành, có đầy đủ giấy tờ chứng minh nguồn gốc.' },
        { question: 'Có cần đơn thuốc để mua không?', answer: 'Một số sản phẩm y tế cần có đơn thuốc của bác sĩ, chúng tôi sẽ tư vấn cụ thể cho từng sản phẩm.' },
        { question: 'Có tư vấn sức khỏe không?', answer: 'Chúng tôi có đội ngũ dược sĩ và chuyên viên tư vấn sức khỏe để hỗ trợ bạn lựa chọn sản phẩm phù hợp.' },
        { question: 'Hạn sử dụng còn bao lâu?', answer: 'Tất cả sản phẩm đều có hạn sử dụng còn ít nhất 12 tháng kể từ ngày mua, đảm bảo chất lượng và hiệu quả sử dụng.' },
        { question: 'Có giao hàng tận nơi không?', answer: 'Chúng tôi có dịch vụ giao hàng tận nơi miễn phí cho đơn hàng trên 300.000đ trong khu vực nội thành.' },
      ],
      'Ô tô & Xe máy': [
        { question: 'Sản phẩm có phụ tùng chính hãng không?', answer: 'Tất cả phụ tùng đều là hàng chính hãng, có đầy đủ tem nhãn và giấy tờ chứng minh nguồn gốc từ nhà sản xuất.' },
        { question: 'Có lắp đặt tại cửa hàng không?', answer: 'Chúng tôi có xưởng lắp đặt chuyên nghiệp với đội ngũ kỹ thuật viên giàu kinh nghiệm, đảm bảo chất lượng lắp đặt.' },
        { question: 'Có bảo hành sản phẩm không?', answer: 'Sản phẩm có bảo hành từ 6-24 tháng tùy theo loại phụ tùng, đảm bảo chất lượng và độ bền.' },
        { question: 'Có dịch vụ bảo dưỡng không?', answer: 'Chúng tôi có dịch vụ bảo dưỡng định kỳ với giá ưu đãi cho khách hàng thân thiết.' },
        { question: 'Có thể trả góp không?', answer: 'Chúng tôi hỗ trợ trả góp 0% lãi suất qua các ngân hàng đối tác cho các sản phẩm có giá trị cao.' },
      ],
      'Bất động sản': [
        { question: 'Có tư vấn pháp lý không?', answer: 'Chúng tôi có đội ngũ luật sư và chuyên viên tư vấn pháp lý để hỗ trợ bạn trong quá trình mua bán bất động sản.' },
        { question: 'Có hỗ trợ vay vốn không?', answer: 'Chúng tôi có quan hệ đối tác với nhiều ngân hàng để hỗ trợ khách hàng vay vốn mua nhà với lãi suất ưu đãi.' },
        { question: 'Có thể xem nhà trước khi mua không?', answer: 'Chúng tôi hỗ trợ khách hàng xem nhà miễn phí, có xe đưa đón và tư vấn chi tiết về từng căn hộ.' },
        { question: 'Có chính sách thanh toán linh hoạt không?', answer: 'Chúng tôi có nhiều phương thức thanh toán linh hoạt, phù hợp với khả năng tài chính của từng khách hàng.' },
        { question: 'Có bảo hành công trình không?', answer: 'Tất cả dự án đều có bảo hành công trình từ 5-10 năm tùy theo loại hạng mục, đảm bảo chất lượng xây dựng.' },
      ],
      'Giáo dục': [
        { question: 'Có khóa học online không?', answer: 'Chúng tôi có đầy đủ các khóa học online và offline, phù hợp với mọi nhu cầu học tập của học viên.' },
        { question: 'Có chứng chỉ sau khi hoàn thành khóa học không?', answer: 'Học viên sẽ nhận được chứng chỉ có giá trị quốc tế sau khi hoàn thành khóa học và vượt qua kỳ thi cuối khóa.' },
        { question: 'Có hỗ trợ học phí không?', answer: 'Chúng tôi có nhiều chương trình học bổng và hỗ trợ học phí cho học viên có hoàn cảnh khó khăn và thành tích xuất sắc.' },
        { question: 'Có tài liệu học tập không?', answer: 'Học viên sẽ được cung cấp đầy đủ tài liệu học tập, sách giáo khoa và các tài nguyên học tập khác.' },
        { question: 'Có thể học lại nếu không đạt không?', answer: 'Học viên có thể đăng ký học lại miễn phí nếu không đạt yêu cầu trong lần học đầu tiên.' },
      ],
      'Du lịch': [
        { question: 'Có tour trọn gói không?', answer: 'Chúng tôi có nhiều tour trọn gói với giá cả hợp lý, bao gồm vé máy bay, khách sạn, ăn uống và các hoạt động du lịch.' },
        { question: 'Có bảo hiểm du lịch không?', answer: 'Tất cả các tour đều bao gồm bảo hiểm du lịch, đảm bảo an toàn cho khách hàng trong suốt chuyến đi.' },
        { question: 'Có thể hủy tour không?', answer: 'Khách hàng có thể hủy tour trước 7 ngày và được hoàn lại 80% giá trị tour, trừ phí dịch vụ.' },
        { question: 'Có hướng dẫn viên không?', answer: 'Tất cả các tour đều có hướng dẫn viên chuyên nghiệp, am hiểu về địa điểm du lịch và có kinh nghiệm phục vụ khách hàng.' },
        { question: 'Có chương trình khuyến mãi không?', answer: 'Chúng tôi thường xuyên có các chương trình khuyến mãi đặc biệt, giảm giá lên đến 30% cho các tour du lịch.' },
      ],
      'Nhà hàng & Khách sạn': [
        { question: 'Có đặt bàn trước không?', answer: 'Chúng tôi hỗ trợ đặt bàn trước qua điện thoại hoặc website, đảm bảo bạn có chỗ ngồi khi đến nhà hàng.' },
        { question: 'Có menu đặc biệt cho người ăn chay không?', answer: 'Chúng tôi có menu đa dạng, bao gồm các món chay và món ăn phù hợp với nhiều chế độ ăn khác nhau.' },
        { question: 'Có phục vụ tiệc không?', answer: 'Chúng tôi có dịch vụ tổ chức tiệc với nhiều gói dịch vụ khác nhau, phù hợp với mọi ngân sách và nhu cầu.' },
        { question: 'Có chương trình khuyến mãi không?', answer: 'Chúng tôi có nhiều chương trình khuyến mãi như giảm giá cho khách hàng thân thiết, combo giá ưu đãi và các chương trình đặc biệt vào các dịp lễ.' },
        { question: 'Có dịch vụ giao hàng không?', answer: 'Chúng tôi có dịch vụ giao hàng tận nơi với phí giao hàng hợp lý, đảm bảo món ăn còn nóng và ngon khi đến tay khách hàng.' },
      ],
      'Khác': [
        { question: 'Có thể tùy chỉnh sản phẩm không?', answer: 'Chúng tôi nhận đặt hàng theo yêu cầu với nhiều tùy chọn tùy chỉnh để phù hợp với nhu cầu cụ thể của bạn.' },
        { question: 'Có dịch vụ tư vấn không?', answer: 'Chúng tôi có đội ngũ chuyên viên tư vấn chuyên nghiệp, sẵn sàng hỗ trợ bạn lựa chọn sản phẩm phù hợp nhất.' },
        { question: 'Có chính sách đổi trả không?', answer: 'Chúng tôi hỗ trợ đổi trả trong vòng 7 ngày với điều kiện sản phẩm còn nguyên vẹn, chưa sử dụng và có hóa đơn mua hàng.' },
        { question: 'Có giao hàng toàn quốc không?', answer: 'Chúng tôi có dịch vụ giao hàng toàn quốc với nhiều phương thức vận chuyển khác nhau, phù hợp với nhu cầu của bạn.' },
        { question: 'Có chương trình khuyến mãi không?', answer: 'Chúng tôi thường xuyên có các chương trình khuyến mãi đặc biệt, giảm giá và tặng quà cho khách hàng.' },
      ],
    }

    return industryFAQs[industry] || [
      { question: 'Câu hỏi thường gặp 1?', answer: 'Câu trả lời mẫu cho câu hỏi thường gặp 1.' },
      { question: 'Câu hỏi thường gặp 2?', answer: 'Câu trả lời mẫu cho câu hỏi thường gặp 2.' },
      { question: 'Câu hỏi thường gặp 3?', answer: 'Câu trả lời mẫu cho câu hỏi thường gặp 3.' },
    ]
  }

  const generateProducts = (industry) => {
    const industryProducts = {
      'Thời trang': [
        { name: 'Áo thun nam', price: '299000', description: 'Áo thun nam chất liệu cotton cao cấp, thoáng mát, dễ mặc' },
        { name: 'Quần jean nữ', price: '599000', description: 'Quần jean nữ form slim, co giãn tốt, phù hợp nhiều dáng người' },
        { name: 'Váy đầm công sở', price: '799000', description: 'Váy đầm công sở thanh lịch, chất liệu cao cấp, nhiều màu sắc' },
        { name: 'Áo khoác gió', price: '899000', description: 'Áo khoác gió chống nước, nhẹ, tiện lợi cho mọi hoạt động ngoài trời' },
        { name: 'Giày thể thao', price: '1299000', description: 'Giày thể thao đế êm, thoáng khí, phù hợp cho chạy bộ và tập luyện' },
      ],
      'Điện tử': [
        { name: 'Điện thoại thông minh', price: '8990000', description: 'Điện thoại thông minh màn hình lớn, camera chất lượng cao, pin lâu' },
        { name: 'Tai nghe không dây', price: '1990000', description: 'Tai nghe không dây chống ồn, pin 30 giờ, chất lượng âm thanh cao' },
        { name: 'Laptop văn phòng', price: '15990000', description: 'Laptop văn phòng hiệu năng cao, màn hình Full HD, pin lâu' },
        { name: 'Smartwatch', price: '3990000', description: 'Đồng hồ thông minh theo dõi sức khỏe, thông báo cuộc gọi, pin 7 ngày' },
        { name: 'Loa Bluetooth', price: '2490000', description: 'Loa Bluetooth công suất lớn, âm thanh sống động, pin 20 giờ' },
      ],
      'Thực phẩm & Đồ uống': [
        { name: 'Gạo thơm ST25', price: '89000', description: 'Gạo thơm ST25 5kg, gạo ngon, dẻo, phù hợp cho gia đình' },
        { name: 'Cà phê hòa tan', price: '129000', description: 'Cà phê hòa tan đóng gói 200g, thơm ngon, tiện lợi' },
        { name: 'Mật ong nguyên chất', price: '299000', description: 'Mật ong nguyên chất 500ml, 100% tự nhiên, tốt cho sức khỏe' },
        { name: 'Trà xanh túi lọc', price: '79000', description: 'Trà xanh túi lọc 100 túi, thanh mát, tốt cho sức khỏe' },
        { name: 'Nước mắm Phú Quốc', price: '89000', description: 'Nước mắm Phú Quốc 500ml, đậm đà, thơm ngon tự nhiên' },
      ],
      'Mỹ phẩm': [
        { name: 'Kem dưỡng ẩm', price: '399000', description: 'Kem dưỡng ẩm da mặt, cấp ẩm sâu, phù hợp mọi loại da' },
        { name: 'Serum vitamin C', price: '599000', description: 'Serum vitamin C làm sáng da, giảm thâm nám, chống lão hóa' },
        { name: 'Sữa rửa mặt', price: '249000', description: 'Sữa rửa mặt dịu nhẹ, làm sạch sâu, không gây khô da' },
        { name: 'Kem chống nắng SPF50', price: '349000', description: 'Kem chống nắng SPF50, chống tia UV, bảo vệ da hiệu quả' },
        { name: 'Toner cân bằng da', price: '299000', description: 'Toner cân bằng độ pH, se khít lỗ chân lông, làm sạch sâu' },
      ],
      'Nội thất': [
        { name: 'Bàn làm việc gỗ', price: '2990000', description: 'Bàn làm việc gỗ tự nhiên, thiết kế hiện đại, rộng rãi' },
        { name: 'Ghế văn phòng', price: '1990000', description: 'Ghế văn phòng ergonomic, điều chỉnh độ cao, êm ái' },
        { name: 'Kệ sách treo tường', price: '899000', description: 'Kệ sách treo tường gỗ MDF, tiết kiệm không gian' },
        { name: 'Đèn bàn LED', price: '399000', description: 'Đèn bàn LED điều chỉnh độ sáng, tiết kiệm điện' },
        { name: 'Tủ quần áo 3 cánh', price: '4990000', description: 'Tủ quần áo 3 cánh gỗ công nghiệp, nhiều ngăn, tiện lợi' },
      ],
      'Sách & Văn phòng phẩm': [
        { name: 'Sách kỹ năng sống', price: '129000', description: 'Sách kỹ năng sống, phát triển bản thân, bìa cứng' },
        { name: 'Bút bi cao cấp', price: '49000', description: 'Bút bi cao cấp, mực mượt, thiết kế sang trọng' },
        { name: 'Sổ tay da', price: '199000', description: 'Sổ tay bìa da, giấy chất lượng cao, phù hợp ghi chép' },
        { name: 'Bộ thước kẻ', price: '79000', description: 'Bộ thước kẻ inox, chính xác, bền bỉ' },
        { name: 'Máy tính cầm tay', price: '299000', description: 'Máy tính cầm tay khoa học, nhiều chức năng' },
      ],
      'Đồ chơi': [
        { name: 'Xe điều khiển từ xa', price: '599000', description: 'Xe điều khiển từ xa, pin sạc, điều khiển 2.4GHz' },
        { name: 'Bộ xếp hình LEGO', price: '899000', description: 'Bộ xếp hình LEGO 500 miếng, phát triển tư duy' },
        { name: 'Búp bê Barbie', price: '399000', description: 'Búp bê Barbie có nhiều phụ kiện, an toàn cho trẻ' },
        { name: 'Đồ chơi giáo dục', price: '299000', description: 'Đồ chơi giáo dục học chữ, số, màu sắc' },
        { name: 'Bóng đá', price: '199000', description: 'Bóng đá size 5, da PU, bền, phù hợp trẻ em' },
      ],
      'Thể thao': [
        { name: 'Giày chạy bộ', price: '1999000', description: 'Giày chạy bộ đế êm, chống sốc, thoáng khí' },
        { name: 'Quần áo thể thao', price: '499000', description: 'Bộ quần áo thể thao co giãn, thấm hút mồ hôi' },
        { name: 'Tạ tay 5kg', price: '299000', description: 'Tạ tay 5kg/cặp, phù hợp tập luyện tại nhà' },
        { name: 'Thảm tập yoga', price: '199000', description: 'Thảm tập yoga chống trượt, dày 6mm, dễ vệ sinh' },
        { name: 'Bình nước thể thao', price: '149000', description: 'Bình nước thể thao 750ml, không BPA, dễ mang theo' },
      ],
      'Y tế & Sức khỏe': [
        { name: 'Máy đo huyết áp', price: '899000', description: 'Máy đo huyết áp điện tử, tự động, dễ sử dụng' },
        { name: 'Nhiệt kế điện tử', price: '199000', description: 'Nhiệt kế điện tử đo nhanh, không cần tiếp xúc' },
        { name: 'Máy xông mũi họng', price: '599000', description: 'Máy xông mũi họng siêu âm, nhỏ gọn, hiệu quả' },
        { name: 'Thực phẩm chức năng', price: '399000', description: 'Thực phẩm chức năng bổ sung vitamin, tăng sức đề kháng' },
        { name: 'Máy massage cầm tay', price: '699000', description: 'Máy massage cầm tay, giảm đau nhức, thư giãn' },
      ],
      'Ô tô & Xe máy': [
        { name: 'Lốp xe máy', price: '399000', description: 'Lốp xe máy chống trượt, bền, phù hợp mọi địa hình' },
        { name: 'Phanh đĩa', price: '599000', description: 'Phanh đĩa xe máy, hiệu quả, an toàn' },
        { name: 'Bình ắc quy', price: '899000', description: 'Bình ắc quy 12V, dung lượng lớn, bền' },
        { name: 'Dầu nhớt động cơ', price: '199000', description: 'Dầu nhớt động cơ 4T, bảo vệ động cơ tốt' },
        { name: 'Kính chắn gió', price: '299000', description: 'Kính chắn gió xe máy, chống tia UV, chống mờ' },
      ],
      'Bất động sản': [
        { name: 'Căn hộ 2 phòng ngủ', price: '2500000000', description: 'Căn hộ 2 phòng ngủ, 70m2, view đẹp, đầy đủ tiện ích' },
        { name: 'Nhà phố 3 tầng', price: '5500000000', description: 'Nhà phố 3 tầng, 120m2, mặt tiền 5m, vị trí đẹp' },
        { name: 'Đất nền dự án', price: '800000000', description: 'Đất nền dự án 100m2, pháp lý rõ ràng, tiềm năng tăng giá' },
        { name: 'Biệt thự ven biển', price: '12000000000', description: 'Biệt thự ven biển, 200m2, view biển, đầy đủ tiện ích' },
        { name: 'Căn hộ studio', price: '1500000000', description: 'Căn hộ studio 35m2, phù hợp người độc thân, giá tốt' },
      ],
      'Giáo dục': [
        { name: 'Khóa học online tiếng Anh', price: '2990000', description: 'Khóa học online tiếng Anh 6 tháng, giáo viên bản ngữ' },
        { name: 'Khóa học lập trình', price: '4990000', description: 'Khóa học lập trình web fullstack, có chứng chỉ' },
        { name: 'Sách giáo khoa bộ mới', price: '599000', description: 'Bộ sách giáo khoa lớp 1-12, bản mới nhất' },
        { name: 'Khóa học kỹ năng mềm', price: '1990000', description: 'Khóa học kỹ năng mềm, giao tiếp, thuyết trình' },
        { name: 'Máy tính bảng học tập', price: '3990000', description: 'Máy tính bảng học tập, nhiều ứng dụng giáo dục' },
      ],
      'Du lịch': [
        { name: 'Tour Đà Lạt 3 ngày 2 đêm', price: '2990000', description: 'Tour Đà Lạt 3 ngày 2 đêm, khách sạn 3 sao, ăn sáng' },
        { name: 'Tour Phú Quốc 4 ngày 3 đêm', price: '4990000', description: 'Tour Phú Quốc 4 ngày 3 đêm, resort 4 sao, ăn buffet' },
        { name: 'Tour Hà Nội - Sapa', price: '3990000', description: 'Tour Hà Nội - Sapa 4 ngày, khám phá vùng núi Tây Bắc' },
        { name: 'Tour Nha Trang 3 ngày', price: '3490000', description: 'Tour Nha Trang 3 ngày, resort biển, nhiều hoạt động' },
        { name: 'Tour Hội An - Huế', price: '4490000', description: 'Tour Hội An - Huế 5 ngày, di sản văn hóa, ẩm thực' },
      ],
      'Nhà hàng & Khách sạn': [
        { name: 'Combo buffet trưa', price: '299000', description: 'Combo buffet trưa, hơn 50 món, đồ uống miễn phí' },
        { name: 'Set menu cao cấp', price: '899000', description: 'Set menu cao cấp 5 món, rượu vang, tráng miệng' },
        { name: 'Phòng khách sạn 1 đêm', price: '1299000', description: 'Phòng khách sạn 1 đêm, view đẹp, bữa sáng miễn phí' },
        { name: 'Combo tiệc sinh nhật', price: '1999000', description: 'Combo tiệc sinh nhật 10 người, bánh kem, trang trí' },
        { name: 'Dịch vụ catering', price: '1500000', description: 'Dịch vụ catering 50 suất, đa dạng món, giao tận nơi' },
      ],
      'Khác': [
        { name: 'Dịch vụ tư vấn', price: '500000', description: 'Dịch vụ tư vấn chuyên nghiệp, hỗ trợ 24/7' },
        { name: 'Sản phẩm tùy chỉnh', price: '1000000', description: 'Sản phẩm tùy chỉnh theo yêu cầu, chất lượng cao' },
        { name: 'Gói dịch vụ VIP', price: '2999000', description: 'Gói dịch vụ VIP, nhiều ưu đãi, hỗ trợ đặc biệt' },
        { name: 'Dịch vụ bảo hành mở rộng', price: '799000', description: 'Dịch vụ bảo hành mở rộng 2 năm, bảo vệ toàn diện' },
        { name: 'Thẻ thành viên', price: '299000', description: 'Thẻ thành viên 1 năm, nhiều ưu đãi, tích điểm' },
      ],
    }

    return industryProducts[industry] || [
      { name: 'Sản phẩm mẫu 1', price: '100000', description: 'Mô tả sản phẩm mẫu 1' },
      { name: 'Sản phẩm mẫu 2', price: '200000', description: 'Mô tả sản phẩm mẫu 2' },
      { name: 'Sản phẩm mẫu 3', price: '300000', description: 'Mô tả sản phẩm mẫu 3' },
    ]
  }

  const generateTones = (industry) => {
    const industryTones = {
      'Thời trang': [
        { name: 'Thân thiện', description: 'Giọng điệu thân thiện, gần gũi, tạo cảm giác dễ chịu' },
        { name: 'Chuyên nghiệp', description: 'Giọng điệu chuyên nghiệp, lịch sự, phù hợp với khách hàng cao cấp' },
        { name: 'Năng động', description: 'Giọng điệu năng động, trẻ trung, phù hợp với giới trẻ' },
      ],
      'Điện tử': [
        { name: 'Kỹ thuật', description: 'Giọng điệu kỹ thuật, chuyên sâu, giải thích rõ ràng về sản phẩm' },
        { name: 'Tư vấn', description: 'Giọng điệu tư vấn, hỗ trợ khách hàng lựa chọn sản phẩm phù hợp' },
        { name: 'Chuyên nghiệp', description: 'Giọng điệu chuyên nghiệp, đáng tin cậy, thể hiện uy tín' },
      ],
      'Thực phẩm & Đồ uống': [
        { name: 'Ấm áp', description: 'Giọng điệu ấm áp, thân thiện, tạo cảm giác gần gũi như gia đình' },
        { name: 'Tự nhiên', description: 'Giọng điệu tự nhiên, chân thành, nhấn mạnh tính tự nhiên của sản phẩm' },
        { name: 'Nhiệt tình', description: 'Giọng điệu nhiệt tình, vui vẻ, tạo không khí tích cực' },
      ],
      'Mỹ phẩm': [
        { name: 'Tư vấn chuyên sâu', description: 'Giọng điệu tư vấn chuyên sâu, am hiểu về da và mỹ phẩm' },
        { name: 'Quan tâm', description: 'Giọng điệu quan tâm, chăm sóc, thể hiện sự lo lắng cho làn da khách hàng' },
        { name: 'Tự tin', description: 'Giọng điệu tự tin, khẳng định chất lượng và hiệu quả sản phẩm' },
      ],
      'Nội thất': [
        { name: 'Tư vấn thiết kế', description: 'Giọng điệu tư vấn thiết kế, giúp khách hàng tạo không gian đẹp' },
        { name: 'Chất lượng', description: 'Giọng điệu nhấn mạnh chất lượng, độ bền và giá trị sản phẩm' },
        { name: 'Sang trọng', description: 'Giọng điệu sang trọng, thể hiện đẳng cấp và phong cách' },
      ],
      'Sách & Văn phòng phẩm': [
        { name: 'Giáo dục', description: 'Giọng điệu giáo dục, khuyến khích học tập và phát triển' },
        { name: 'Hữu ích', description: 'Giọng điệu hữu ích, nhấn mạnh giá trị và lợi ích của sản phẩm' },
        { name: 'Truyền cảm hứng', description: 'Giọng điệu truyền cảm hứng, khuyến khích đọc sách và học hỏi' },
      ],
      'Đồ chơi': [
        { name: 'Vui tươi', description: 'Giọng điệu vui tươi, tạo không khí vui vẻ và hứng thú' },
        { name: 'An toàn', description: 'Giọng điệu nhấn mạnh sự an toàn, đảm bảo sức khỏe trẻ em' },
        { name: 'Giáo dục', description: 'Giọng điệu giáo dục, nhấn mạnh tính giáo dục và phát triển của đồ chơi' },
      ],
      'Thể thao': [
        { name: 'Năng động', description: 'Giọng điệu năng động, khuyến khích vận động và rèn luyện sức khỏe' },
        { name: 'Động viên', description: 'Giọng điệu động viên, khuyến khích vượt qua giới hạn bản thân' },
        { name: 'Chuyên nghiệp', description: 'Giọng điệu chuyên nghiệp, thể hiện chất lượng và hiệu năng sản phẩm' },
      ],
      'Y tế & Sức khỏe': [
        { name: 'Chăm sóc', description: 'Giọng điệu chăm sóc, thể hiện sự quan tâm đến sức khỏe khách hàng' },
        { name: 'Tin cậy', description: 'Giọng điệu tin cậy, đáng tin cậy, thể hiện uy tín và chuyên môn' },
        { name: 'An toàn', description: 'Giọng điệu nhấn mạnh sự an toàn, đảm bảo chất lượng và hiệu quả' },
      ],
      'Ô tô & Xe máy': [
        { name: 'Kỹ thuật', description: 'Giọng điệu kỹ thuật, giải thích chi tiết về sản phẩm và phụ tùng' },
        { name: 'Đáng tin cậy', description: 'Giọng điệu đáng tin cậy, thể hiện chất lượng và độ bền sản phẩm' },
        { name: 'Tư vấn', description: 'Giọng điệu tư vấn, hỗ trợ khách hàng lựa chọn sản phẩm phù hợp' },
      ],
      'Bất động sản': [
        { name: 'Chuyên nghiệp', description: 'Giọng điệu chuyên nghiệp, thể hiện uy tín và kinh nghiệm' },
        { name: 'Tư vấn đầu tư', description: 'Giọng điệu tư vấn đầu tư, phân tích giá trị và tiềm năng' },
        { name: 'Tin cậy', description: 'Giọng điệu tin cậy, đảm bảo tính minh bạch và pháp lý' },
      ],
      'Giáo dục': [
        { name: 'Giáo dục', description: 'Giọng điệu giáo dục, khuyến khích học tập và phát triển' },
        { name: 'Động viên', description: 'Giọng điệu động viên, khuyến khích học viên vượt qua thử thách' },
        { name: 'Chuyên nghiệp', description: 'Giọng điệu chuyên nghiệp, thể hiện chất lượng đào tạo' },
      ],
      'Du lịch': [
        { name: 'Hứng khởi', description: 'Giọng điệu hứng khởi, tạo cảm giác phấn khích và mong đợi' },
        { name: 'Thư giãn', description: 'Giọng điệu thư giãn, tạo cảm giác thoải mái và nghỉ ngơi' },
        { name: 'Khám phá', description: 'Giọng điệu khám phá, khuyến khích trải nghiệm và khám phá' },
      ],
      'Nhà hàng & Khách sạn': [
        { name: 'Chào đón', description: 'Giọng điệu chào đón, tạo cảm giác ấm áp và thân thiện' },
        { name: 'Phục vụ', description: 'Giọng điệu phục vụ, thể hiện sự tận tâm và chuyên nghiệp' },
        { name: 'Sang trọng', description: 'Giọng điệu sang trọng, thể hiện đẳng cấp và chất lượng dịch vụ' },
      ],
      'Khác': [
        { name: 'Linh hoạt', description: 'Giọng điệu linh hoạt, phù hợp với nhiều nhu cầu khác nhau' },
        { name: 'Tư vấn', description: 'Giọng điệu tư vấn, hỗ trợ khách hàng tìm giải pháp phù hợp' },
        { name: 'Chuyên nghiệp', description: 'Giọng điệu chuyên nghiệp, thể hiện chất lượng và uy tín' },
      ],
    }

    return industryTones[industry] || [
      { name: 'Tone mẫu 1', description: 'Mô tả tone mẫu 1' },
      { name: 'Tone mẫu 2', description: 'Mô tả tone mẫu 2' },
      { name: 'Tone mẫu 3', description: 'Mô tả tone mẫu 3' },
    ]
  }

  const handleNext = () => {
    if (activeStep === 0) {
      if (!selectedIndustry) {
        setToast({
          open: true,
          message: 'Vui lòng chọn ngành hàng',
          severity: 'warning',
        })
        return
      }
      generateSampleData(selectedIndustry)
    }
    setActiveStep((prevActiveStep) => prevActiveStep + 1)
  }

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1)
  }

  const handleFinish = async () => {
    setLoading(true)
    try {
      // Save FAQs sequentially (only create new ones, not existing ones)
      for (const faq of generatedFAQs) {
        if (faq.question && faq.answer && !faq._id) {
          // Only create if it doesn't have _id (not existing)
          await new Promise((resolve) => {
            dispatch({
              type: 'CREATE_FAQ_REQUEST',
              payload: {
                question: faq.question,
                answer: faq.answer,
              },
            })
            setTimeout(resolve, 500)
          })
        }
      }

      // Save new Tones sequentially (only create new ones, not selected ones) and collect created tone IDs
      const createdToneNames = []
      for (const tone of generatedTones) {
        if (tone.name && tone.description && !tone._id) {
          // Only create if it doesn't have _id (not existing)
          createdToneNames.push(tone.name)
          await new Promise((resolve) => {
            dispatch({
              type: 'CREATE_TONE_REQUEST',
              payload: {
                name: tone.name,
                description: tone.description,
                isPreset: false, // User-created tones are not preset
              },
            })
            setTimeout(resolve, 800) // Increased timeout to ensure API call completes
          })
        }
      }
      
      // Reload tones to get the newly created ones with their IDs from API
      dispatch({ type: 'GET_TONES_REQUEST' })
      await new Promise((resolve) => setTimeout(resolve, 1500)) // Wait for API to return updated tones

      // Get or create sample attributes (name, price, description)
      dispatch({ type: 'GET_ATTRIBUTES_REQUEST' })
      await new Promise((resolve) => setTimeout(resolve, 1000)) // Wait for attributes to load

      const attributes = existingAttributes || []
      
      // Find or create attributes
      let nameAttr = attributes.find(attr => attr.name === 'Tên sản phẩm' || attr.name === 'name')
      let priceAttr = attributes.find(attr => attr.name === 'Giá' || attr.name === 'price')
      let descAttr = attributes.find(attr => attr.name === 'Mô tả' || attr.name === 'description')

      // Create attributes if they don't exist
      if (!nameAttr) {
        await new Promise((resolve) => {
          dispatch({
            type: 'CREATE_ATTRIBUTE_REQUEST',
            payload: {
              name: 'Tên sản phẩm',
              type: 'text',
              required: true,
            },
          })
          setTimeout(() => {
            dispatch({ type: 'GET_ATTRIBUTES_REQUEST' })
            setTimeout(resolve, 500)
          }, 500)
        })
        // Reload attributes to get the new one
        const updatedAttributes = existingAttributes || []
        nameAttr = updatedAttributes.find(attr => attr.name === 'Tên sản phẩm')
      }

      if (!priceAttr) {
        await new Promise((resolve) => {
          dispatch({
            type: 'CREATE_ATTRIBUTE_REQUEST',
            payload: {
              name: 'Giá',
              type: 'number',
              required: true,
            },
          })
          setTimeout(() => {
            dispatch({ type: 'GET_ATTRIBUTES_REQUEST' })
            setTimeout(resolve, 500)
          }, 500)
        })
        const updatedAttributes = existingAttributes || []
        priceAttr = updatedAttributes.find(attr => attr.name === 'Giá')
      }

      if (!descAttr) {
        await new Promise((resolve) => {
          dispatch({
            type: 'CREATE_ATTRIBUTE_REQUEST',
            payload: {
              name: 'Mô tả',
              type: 'textarea',
              required: false,
            },
          })
          setTimeout(() => {
            dispatch({ type: 'GET_ATTRIBUTES_REQUEST' })
            setTimeout(resolve, 500)
          }, 500)
        })
        const updatedAttributes = existingAttributes || []
        descAttr = updatedAttributes.find(attr => attr.name === 'Mô tả')
      }

      // Reload attributes one more time to ensure we have all IDs
      dispatch({ type: 'GET_ATTRIBUTES_REQUEST' })
      await new Promise((resolve) => setTimeout(resolve, 500))
      const finalAttributes = existingAttributes || []
      const finalNameAttr = finalAttributes.find(attr => attr.name === 'Tên sản phẩm' || attr.name === 'name')
      const finalPriceAttr = finalAttributes.find(attr => attr.name === 'Giá' || attr.name === 'price')
      const finalDescAttr = finalAttributes.find(attr => attr.name === 'Mô tả' || attr.name === 'description')

      // Create products with attributes
      let createdProductsCount = 0
      for (const product of generatedProducts) {
        if (product.name && finalNameAttr && finalPriceAttr) {
          const productAttributes = {}
          if (finalNameAttr._id || finalNameAttr.id) {
            productAttributes[finalNameAttr._id || finalNameAttr.id] = product.name
          }
          if (finalPriceAttr._id || finalPriceAttr.id) {
            productAttributes[finalPriceAttr._id || finalPriceAttr.id] = Number(product.price) || product.price
          }
          if (finalDescAttr && (finalDescAttr._id || finalDescAttr.id) && product.description) {
            productAttributes[finalDescAttr._id || finalDescAttr.id] = product.description
          }

          if (Object.keys(productAttributes).length > 0) {
            await new Promise((resolve) => {
              dispatch({
                type: 'CREATE_PRODUCT_REQUEST',
                payload: {
                  attributes: productAttributes,
                },
              })
              setTimeout(resolve, 500)
            })
            createdProductsCount++
          }
        }
      }

      // Refresh products list
      dispatch({ type: 'GET_PRODUCTS_REQUEST' })

      // Save setup configuration to localStorage
      const setupConfig = {
        industry: selectedIndustry,
        faqs: generatedFAQs,
        products: generatedProducts,
        tones: [
          ...selectedTones.map(t => ({ _id: t._id, name: t.name, description: t.description })),
          ...generatedTones
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      
      // Save to localStorage
      const existingSetups = JSON.parse(localStorage.getItem('botSetups') || '[]')
      existingSetups.push(setupConfig)
      localStorage.setItem('botSetups', JSON.stringify(existingSetups))
      
      // Also save current setup as "last setup"
      localStorage.setItem('lastBotSetup', JSON.stringify(setupConfig))

      // Auto-select the first tone created from QuickBotSetup
      // Priority: 1. First generated tone (newly created from API), 2. First selected tone, 3. First preset tone
      let selectedToneId = 'preset-1' // Default fallback
      let selectedToneName = 'mặc định'
      
      // Get the latest tones from Redux state after reload
      const latestTones = existingTones || []
      
      if (generatedTones.length > 0 && createdToneNames.length > 0) {
        // Find the first generated tone in the API tones list by matching name
        const firstToneName = createdToneNames[0]
        const matchingTone = latestTones.find(t => t.name === firstToneName)
        if (matchingTone && matchingTone._id) {
          selectedToneId = `api-${matchingTone._id}`
          selectedToneName = matchingTone.name
        }
      } else if (selectedTones.length > 0) {
        // Use first selected tone (already exists in API)
        const firstSelectedTone = selectedTones[0]
        if (firstSelectedTone._id) {
          selectedToneId = `api-${firstSelectedTone._id}`
          selectedToneName = firstSelectedTone.name
        }
      }
      
      // Save selected tone to localStorage so ToneAI page can pick it up
      localStorage.setItem('selectedTone', selectedToneId)

      setToast({
        open: true,
        message: `Đã tạo chat bot thành công! ${generatedFAQs.filter(f => !f._id).length} FAQs mới, ${generatedTones.length + selectedTones.length} Tones (${generatedTones.length} mới, ${selectedTones.length} đã chọn), và ${createdProductsCount} Products đã được lưu vào hệ thống. Tone "${selectedToneName}" đã được chọn tự động.`,
        severity: 'success',
      })

      setTimeout(() => {
        navigate('/')
      }, 3000)
    } catch (error) {
      console.error('Error in handleFinish:', error)
      setToast({
        open: true,
        message: 'Có lỗi xảy ra khi lưu dữ liệu: ' + (error.message || 'Unknown error'),
        severity: 'error',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEditFAQ = (index) => {
    setEditingFAQ(index)
  }

  const handleSaveFAQ = (index, faq) => {
    const updated = [...generatedFAQs]
    updated[index] = faq
    setGeneratedFAQs(updated)
    setEditingFAQ(null)
  }

  const handleDeleteFAQ = (index) => {
    setGeneratedFAQs(generatedFAQs.filter((_, i) => i !== index))
    // Remove from selected if it was selected
    setSelectedFAQs(selectedFAQs.filter(i => i !== index))
  }

  const handleAddFAQ = () => {
    setGeneratedFAQs([...generatedFAQs, { question: '', answer: '' }])
    setEditingFAQ(generatedFAQs.length)
  }

  const handleSelectAllFAQs = () => {
    if (selectedFAQs.length === generatedFAQs.length) {
      setSelectedFAQs([])
    } else {
      setSelectedFAQs(generatedFAQs.map((_, index) => index))
    }
  }

  const handleToggleFAQ = (index) => {
    if (selectedFAQs.includes(index)) {
      setSelectedFAQs(selectedFAQs.filter(i => i !== index))
    } else {
      setSelectedFAQs([...selectedFAQs, index])
    }
  }

  const handleDeleteSelectedFAQs = () => {
    if (selectedFAQs.length === 0) {
      setToast({
        open: true,
        message: 'Vui lòng chọn ít nhất một FAQ để xóa',
        severity: 'warning',
      })
      return
    }
    
    // Sort indices in descending order to avoid index shifting issues
    const sortedIndices = [...selectedFAQs].sort((a, b) => b - a)
    let updatedFAQs = [...generatedFAQs]
    sortedIndices.forEach(index => {
      updatedFAQs = updatedFAQs.filter((_, i) => i !== index)
    })
    setGeneratedFAQs(updatedFAQs)
    setSelectedFAQs([])
    
    setToast({
      open: true,
      message: `Đã xóa ${selectedFAQs.length} FAQ`,
      severity: 'success',
    })
  }

  const handleEditProduct = (index) => {
    setEditingProduct(index)
  }

  const handleSaveProduct = (index, product) => {
    const updated = [...generatedProducts]
    updated[index] = product
    setGeneratedProducts(updated)
    setEditingProduct(null)
  }

  const handleDeleteProduct = (index) => {
    setGeneratedProducts(generatedProducts.filter((_, i) => i !== index))
  }

  const handleAddProduct = () => {
    setGeneratedProducts([...generatedProducts, { name: '', price: '', description: '' }])
    setEditingProduct(generatedProducts.length)
  }

  const handleEditTone = (index) => {
    setEditingTone(index)
  }

  const handleSaveTone = (index, tone) => {
    const updated = [...generatedTones]
    updated[index] = tone
    setGeneratedTones(updated)
    setEditingTone(null)
  }

  const handleDeleteTone = (index) => {
    setGeneratedTones(generatedTones.filter((_, i) => i !== index))
  }

  const handleAddTone = () => {
    setGeneratedTones([...generatedTones, { name: '', description: '' }])
    setEditingTone(generatedTones.length)
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
          Tạo chat Bot Nhanh
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Tạo bot chat tự động với dữ liệu mẫu dựa trên ngành hàng của bạn
        </Typography>
      </Box>

      <Card>
        <CardContent>
          <Stepper activeStep={activeStep} orientation="vertical">
            {/* Step 1: Chọn ngành hàng */}
            <Step>
              <StepLabel>Chọn ngành hàng</StepLabel>
              <StepContent>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Chọn ngành hàng để hệ thống tự động tạo dữ liệu mẫu phù hợp
                  </Typography>
                  <Autocomplete
                    options={industries}
                    value={selectedIndustry}
                    onChange={(event, newValue) => {
                      setSelectedIndustry(newValue)
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Ngành hàng"
                        placeholder="Chọn hoặc nhập ngành hàng"
                        fullWidth
                      />
                    )}
                    freeSolo
                  />
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/')}
                    startIcon={<ArrowBackIcon />}
                  >
                    Hủy
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    endIcon={<ArrowForwardIcon />}
                    disabled={!selectedIndustry}
                  >
                    Tiếp theo
                  </Button>
                </Box>
              </StepContent>
            </Step>

            {/* Step 2: FAQs mẫu */}
            <Step>
              <StepLabel>
                FAQs mẫu
                {generatedFAQs.length > 0 && (
                  <Chip 
                    label={`${generatedFAQs.length} FAQs`} 
                    size="small" 
                    color="success" 
                    sx={{ ml: 1 }}
                  />
                )}
              </StepLabel>
              <StepContent>
                <Box sx={{ mb: 3 }}>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    {generatedFAQs.length > 0 
                      ? `Đã có ${generatedFAQs.length} FAQs. Bạn có thể chỉnh sửa hoặc thêm mới.`
                      : 'Các câu hỏi thường gặp sẽ được tạo tự động. Bạn có thể chỉnh sửa hoặc thêm mới.'
                    }
                  </Alert>
                  
                  {/* Bulk actions */}
                  {generatedFAQs.length > 0 && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, p: 1.5, bgcolor: 'action.hover', borderRadius: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Checkbox
                          checked={selectedFAQs.length === generatedFAQs.length && generatedFAQs.length > 0}
                          indeterminate={selectedFAQs.length > 0 && selectedFAQs.length < generatedFAQs.length}
                          onChange={handleSelectAllFAQs}
                        />
                        <Typography variant="body2">
                          {selectedFAQs.length > 0 
                            ? `Đã chọn ${selectedFAQs.length}/${generatedFAQs.length}`
                            : 'Chọn tất cả'
                          }
                        </Typography>
                      </Box>
                      {selectedFAQs.length > 0 && (
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          startIcon={<DeleteSweepIcon />}
                          onClick={handleDeleteSelectedFAQs}
                        >
                          Xóa đã chọn ({selectedFAQs.length})
                        </Button>
                      )}
                    </Box>
                  )}

                  {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                      <CircularProgress />
                    </Box>
                  ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {generatedFAQs.map((faq, index) => (
                        <Paper 
                          key={index} 
                          sx={{ 
                            p: 2,
                            border: selectedFAQs.includes(index) ? '2px solid' : '1px solid',
                            borderColor: selectedFAQs.includes(index) ? 'primary.main' : 'divider',
                            bgcolor: selectedFAQs.includes(index) ? 'primary.light' : 'background.paper',
                          }}
                        >
                          {editingFAQ === index ? (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                              <TextField
                                fullWidth
                                label="Câu hỏi"
                                value={faq.question}
                                onChange={(e) => {
                                  const updated = [...generatedFAQs]
                                  updated[index].question = e.target.value
                                  setGeneratedFAQs(updated)
                                }}
                              />
                              <TextField
                                fullWidth
                                multiline
                                rows={3}
                                label="Câu trả lời"
                                value={faq.answer}
                                onChange={(e) => {
                                  const updated = [...generatedFAQs]
                                  updated[index].answer = e.target.value
                                  setGeneratedFAQs(updated)
                                }}
                              />
                              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                                <Button
                                  size="small"
                                  onClick={() => setEditingFAQ(null)}
                                >
                                  Hủy
                                </Button>
                                <Button
                                  size="small"
                                  variant="contained"
                                  onClick={() => handleSaveFAQ(index, faq)}
                                >
                                  Lưu
                                </Button>
                              </Box>
                            </Box>
                          ) : (
                            <Box>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'start', gap: 1, flex: 1 }}>
                                  <Checkbox
                                    checked={selectedFAQs.includes(index)}
                                    onChange={() => handleToggleFAQ(index)}
                                    size="small"
                                    sx={{ mt: 0.5 }}
                                  />
                                  <Box sx={{ flex: 1 }}>
                                    <Typography variant="subtitle2" fontWeight={600}>
                                      {faq.question}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                      {faq.answer}
                                    </Typography>
                                  </Box>
                                </Box>
                                <Box sx={{ display: 'flex', gap: 0.5 }}>
                                  <IconButton
                                    size="small"
                                    onClick={() => handleEditFAQ(index)}
                                  >
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => handleDeleteFAQ(index)}
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Box>
                              </Box>
                            </Box>
                          )}
                        </Paper>
                      ))}
                      <Button
                        variant="outlined"
                        startIcon={<AddIcon />}
                        onClick={handleAddFAQ}
                        fullWidth
                      >
                        Thêm FAQ mới
                      </Button>
                    </Box>
                  )}
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button variant="outlined" onClick={handleBack} startIcon={<ArrowBackIcon />}>
                    Quay lại
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    endIcon={<ArrowForwardIcon />}
                    disabled={generatedFAQs.length === 0}
                  >
                    Tiếp theo
                  </Button>
                </Box>
              </StepContent>
            </Step>

            {/* Step 3: Dữ liệu sản phẩm mẫu */}
            <Step>
              <StepLabel>
                Dữ liệu sản phẩm mẫu
                {generatedProducts.length > 0 && (
                  <Chip 
                    label={`${generatedProducts.length} sản phẩm`} 
                    size="small" 
                    color="success" 
                    sx={{ ml: 1 }}
                  />
                )}
              </StepLabel>
              <StepContent>
                <Box sx={{ mb: 3 }}>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    {generatedProducts.length > 0
                      ? `Đã có ${generatedProducts.length} sản phẩm. Bạn có thể chỉnh sửa hoặc thêm mới.`
                      : 'Dữ liệu sản phẩm mẫu sẽ được tạo. Bạn có thể chỉnh sửa hoặc thêm mới.'
                    }
                    <br />
                    <strong>Lưu ý:</strong> Để tạo sản phẩm, bạn cần tạo thuộc tính sản phẩm trước.
                  </Alert>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {generatedProducts.map((product, index) => (
                      <Paper key={index} sx={{ p: 2 }}>
                        {editingProduct === index ? (
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <TextField
                              fullWidth
                              label="Tên sản phẩm"
                              value={product.name}
                              onChange={(e) => {
                                const updated = [...generatedProducts]
                                updated[index].name = e.target.value
                                setGeneratedProducts(updated)
                              }}
                            />
                            <TextField
                              fullWidth
                              label="Giá"
                              type="number"
                              value={product.price}
                              onChange={(e) => {
                                const updated = [...generatedProducts]
                                updated[index].price = e.target.value
                                setGeneratedProducts(updated)
                              }}
                            />
                            <TextField
                              fullWidth
                              multiline
                              rows={3}
                              label="Mô tả"
                              value={product.description}
                              onChange={(e) => {
                                const updated = [...generatedProducts]
                                updated[index].description = e.target.value
                                setGeneratedProducts(updated)
                              }}
                            />
                            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                              <Button
                                size="small"
                                onClick={() => setEditingProduct(null)}
                              >
                                Hủy
                              </Button>
                              <Button
                                size="small"
                                variant="contained"
                                onClick={() => handleSaveProduct(index, product)}
                              >
                                Lưu
                              </Button>
                            </Box>
                          </Box>
                        ) : (
                          <Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                              <Box>
                                <Typography variant="subtitle2" fontWeight={600}>
                                  {product.name}
                                </Typography>
                                <Typography variant="body2" color="primary" fontWeight={600}>
                                  {parseInt(product.price).toLocaleString('vi-VN')} đ
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', gap: 0.5 }}>
                                <IconButton
                                  size="small"
                                  onClick={() => handleEditProduct(index)}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleDeleteProduct(index)}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Box>
                            </Box>
                            <Typography variant="body2" color="text.secondary">
                              {product.description}
                            </Typography>
                          </Box>
                        )}
                      </Paper>
                    ))}
                    <Button
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={handleAddProduct}
                      fullWidth
                    >
                      Thêm sản phẩm mới
                    </Button>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button variant="outlined" onClick={handleBack} startIcon={<ArrowBackIcon />}>
                    Quay lại
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    endIcon={<ArrowForwardIcon />}
                    disabled={generatedProducts.length === 0}
                  >
                    Tiếp theo
                  </Button>
                </Box>
              </StepContent>
            </Step>

            {/* Step 4: Tone AI mẫu */}
            <Step>
              <StepLabel>
                Tone AI mẫu
                {(generatedTones.length > 0 || selectedTones.length > 0) && (
                  <Chip 
                    label={`${generatedTones.length + selectedTones.length} tones`} 
                    size="small" 
                    color="success" 
                    sx={{ ml: 1 }}
                  />
                )}
              </StepLabel>
              <StepContent>
                <Box sx={{ mb: 3 }}>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    Bạn có thể chọn tone từ danh sách có sẵn hoặc tạo tone mới. Tổng cộng: {generatedTones.length + selectedTones.length} tones.
                  </Alert>
                  
                  {/* Select existing tones */}
                  {existingTones && existingTones.length > 0 && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                        Chọn tone từ danh sách có sẵn:
                      </Typography>
                      <Autocomplete
                        multiple
                        options={(() => {
                          // Remove duplicates from existingTones based on _id
                          const uniqueTones = []
                          const seenIds = new Set()
                          for (const tone of existingTones) {
                            const toneId = tone._id || tone.id
                            if (toneId && !seenIds.has(toneId)) {
                              seenIds.add(toneId)
                              uniqueTones.push(tone)
                            } else if (!toneId) {
                              // Handle tones without _id by name
                              const name = tone.name || ''
                              if (name && !uniqueTones.find(t => (t._id || t.id) === toneId || t.name === name)) {
                                uniqueTones.push(tone)
                              }
                            }
                          }
                          return uniqueTones
                        })()}
                        getOptionLabel={(option) => option.name || ''}
                        isOptionEqualToValue={(option, value) => {
                          // Compare by _id if available, otherwise by name
                          const optionId = option._id || option.id
                          const valueId = value._id || value.id
                          if (optionId && valueId) {
                            return optionId === valueId
                          }
                          return option.name === value.name
                        }}
                        value={selectedTones}
                        onChange={(event, newValue) => {
                          // Remove duplicates from newValue
                          const uniqueNewValue = []
                          const seenIds = new Set()
                          for (const tone of newValue) {
                            const toneId = tone._id || tone.id
                            if (toneId && !seenIds.has(toneId)) {
                              seenIds.add(toneId)
                              uniqueNewValue.push(tone)
                            } else if (!toneId) {
                              // Handle tones without _id by name
                              const name = tone.name || ''
                              if (name && !uniqueNewValue.find(t => t.name === name)) {
                                uniqueNewValue.push(tone)
                              }
                            }
                          }
                          setSelectedTones(uniqueNewValue)
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Chọn tone"
                            placeholder="Chọn tone từ danh sách"
                            fullWidth
                          />
                        )}
                        renderTags={(value, getTagProps) =>
                          value.map((option, index) => (
                            <Chip
                              label={option.name}
                              {...getTagProps({ index })}
                              key={option._id || option.id || index}
                            />
                          ))
                        }
                        renderOption={(props, option) => (
                          <Box component="li" {...props}>
                            <Box>
                              <Typography variant="body2" fontWeight={600}>
                                {option.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {option.description}
                              </Typography>
                            </Box>
                          </Box>
                        )}
                      />
                    </Box>
                  )}

                  {/* Generated/New tones */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                      Tone mới được tạo:
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {generatedTones.map((tone, index) => (
                        <Paper key={index} sx={{ p: 2 }}>
                          {editingTone === index ? (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                              <TextField
                                fullWidth
                                label="Tên tone"
                                value={tone.name}
                                onChange={(e) => {
                                  const updated = [...generatedTones]
                                  updated[index].name = e.target.value
                                  setGeneratedTones(updated)
                                }}
                              />
                              <TextField
                                fullWidth
                                multiline
                                rows={3}
                                label="Mô tả"
                                value={tone.description}
                                onChange={(e) => {
                                  const updated = [...generatedTones]
                                  updated[index].description = e.target.value
                                  setGeneratedTones(updated)
                                }}
                              />
                              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                                <Button
                                  size="small"
                                  onClick={() => setEditingTone(null)}
                                >
                                  Hủy
                                </Button>
                                <Button
                                  size="small"
                                  variant="contained"
                                  onClick={() => handleSaveTone(index, tone)}
                                >
                                  Lưu
                                </Button>
                              </Box>
                            </Box>
                          ) : (
                            <Box>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                                <Box>
                                  <Chip label={tone.name} color="primary" sx={{ mb: 1 }} />
                                  <Typography variant="body2" color="text.secondary">
                                    {tone.description}
                                  </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', gap: 0.5 }}>
                                  <IconButton
                                    size="small"
                                    onClick={() => handleEditTone(index)}
                                  >
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => handleDeleteTone(index)}
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Box>
                              </Box>
                            </Box>
                          )}
                        </Paper>
                      ))}
                      <Button
                        variant="outlined"
                        startIcon={<AddIcon />}
                        onClick={handleAddTone}
                        fullWidth
                      >
                        Thêm tone mới
                      </Button>
                    </Box>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button variant="outlined" onClick={handleBack} startIcon={<ArrowBackIcon />}>
                    Quay lại
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    endIcon={<ArrowForwardIcon />}
                    disabled={generatedTones.length === 0 && selectedTones.length === 0}
                  >
                    Tiếp theo
                  </Button>
                </Box>
              </StepContent>
            </Step>

            {/* Step 5: Hoàn thành */}
            <Step>
              <StepLabel>Hoàn thành</StepLabel>
              <StepContent>
                <Box sx={{ mb: 3 }}>
                  <Alert severity="success" sx={{ mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      Đã tạo dữ liệu mẫu thành công!
                    </Typography>
                    <Typography variant="body2">
                      Bạn có thể xem lại và chỉnh sửa các dữ liệu đã tạo trước khi lưu.
                    </Typography>
                  </Alert>

                  <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                      <Paper 
                        sx={{ 
                          p: 2, 
                          textAlign: 'center',
                          border: generatedFAQs.length > 0 ? '2px solid' : '1px solid',
                          borderColor: generatedFAQs.length > 0 ? 'success.main' : 'divider',
                          bgcolor: generatedFAQs.length > 0 ? 'success.light' : 'background.paper',
                        }}
                      >
                        <CheckCircleIcon 
                          color={generatedFAQs.length > 0 ? 'success' : 'disabled'} 
                          sx={{ fontSize: 48, mb: 1 }} 
                        />
                        <Typography variant="h6" gutterBottom fontWeight={600}>
                          {generatedFAQs.length}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          FAQs
                        </Typography>
                        {generatedFAQs.length > 0 && (
                          <Chip 
                            label="Đã tạo" 
                            size="small" 
                            color="success" 
                            sx={{ mt: 1 }}
                          />
                        )}
                      </Paper>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Paper 
                        sx={{ 
                          p: 2, 
                          textAlign: 'center',
                          border: generatedProducts.length > 0 ? '2px solid' : '1px solid',
                          borderColor: generatedProducts.length > 0 ? 'success.main' : 'divider',
                          bgcolor: generatedProducts.length > 0 ? 'success.light' : 'background.paper',
                        }}
                      >
                        <CheckCircleIcon 
                          color={generatedProducts.length > 0 ? 'success' : 'disabled'} 
                          sx={{ fontSize: 48, mb: 1 }} 
                        />
                        <Typography variant="h6" gutterBottom fontWeight={600}>
                          {generatedProducts.length}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Sản phẩm
                        </Typography>
                        {generatedProducts.length > 0 && (
                          <Chip 
                            label="Đã tạo" 
                            size="small" 
                            color="success" 
                            sx={{ mt: 1 }}
                          />
                        )}
                      </Paper>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Paper 
                        sx={{ 
                          p: 2, 
                          textAlign: 'center',
                          border: (generatedTones.length > 0 || selectedTones.length > 0) ? '2px solid' : '1px solid',
                          borderColor: (generatedTones.length > 0 || selectedTones.length > 0) ? 'success.main' : 'divider',
                          bgcolor: (generatedTones.length > 0 || selectedTones.length > 0) ? 'success.light' : 'background.paper',
                        }}
                      >
                        <CheckCircleIcon 
                          color={(generatedTones.length > 0 || selectedTones.length > 0) ? 'success' : 'disabled'} 
                          sx={{ fontSize: 48, mb: 1 }} 
                        />
                        <Typography variant="h6" gutterBottom fontWeight={600}>
                          {generatedTones.length + selectedTones.length}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Tone AI
                        </Typography>
                        {(generatedTones.length > 0 || selectedTones.length > 0) && (
                          <Chip 
                            label="Đã tạo" 
                            size="small" 
                            color="success" 
                            sx={{ mt: 1 }}
                          />
                        )}
                      </Paper>
                    </Grid>
                  </Grid>
                  
                  {/* Summary of created items */}
                  {(generatedFAQs.length > 0 || generatedProducts.length > 0 || generatedTones.length > 0 || selectedTones.length > 0) && (
                    <Box sx={{ mt: 3 }}>
                      <Divider sx={{ mb: 2 }} />
                      <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                        Tóm tắt dữ liệu đã tạo:
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {generatedFAQs.length > 0 && (
                          <Typography variant="body2" color="text.secondary">
                            ✓ {generatedFAQs.length} FAQs đã được tạo và lưu vào hệ thống
                          </Typography>
                        )}
                        {(generatedTones.length > 0 || selectedTones.length > 0) && (
                          <Typography variant="body2" color="text.secondary">
                            ✓ {generatedTones.length + selectedTones.length} Tone AI ({generatedTones.length} mới, {selectedTones.length} đã chọn) đã được lưu vào hệ thống
                          </Typography>
                        )}
                        {generatedProducts.length > 0 && (
                          <Typography variant="body2" color="text.secondary">
                            ℹ {generatedProducts.length} sản phẩm mẫu (cần thiết lập thuộc tính trước khi lưu)
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  )}
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button variant="outlined" onClick={handleBack} startIcon={<ArrowBackIcon />}>
                    Quay lại
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleFinish}
                    startIcon={<CheckCircleIcon />}
                    disabled={loading}
                  >
                    {loading ? 'Đang lưu...' : 'Hoàn thành'}
                  </Button>
                </Box>
              </StepContent>
            </Step>
          </Stepper>
        </CardContent>
      </Card>

      <Toast
        open={toast.open}
        message={toast.message}
        severity={toast.severity}
        onClose={() => setToast({ ...toast, open: false })}
      />
    </Container>
  )
}

export default QuickBotSetup

