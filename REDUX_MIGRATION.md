# Redux Migration - Chuyển từ localStorage sang Backend API

## ✅ Đã hoàn thành:

1. **Reducers và Sagas:**
   - ✅ `productAttributeReducer.js` + `productAttributeSaga.js`
   - ✅ `productReducer.js` + `productSaga.js`
   - ✅ `orderReducer.js` + `orderSaga.js`
   - ✅ `templateReducer.js` + `templateSaga.js`
   - ✅ `toneReducer.js` + `toneSaga.js`
   - ✅ `settingsReducer.js` + `settingsSaga.js`
   - ✅ Đã thêm vào `store/reducers/index.js` và `store/sagas/index.js`

2. **Components đã cập nhật:**
   - ✅ `Attributes.jsx` - Dùng Redux thay vì localStorage
   - ✅ `Users.jsx` - Dùng Redux thay vì localStorage (cần sửa một số chỗ dùng `user.id` → `user._id || user.id`)
   - ✅ `FAQs.jsx` - Đã dùng Redux từ trước

## ⏳ Cần cập nhật:

1. **ProductsList.jsx:**
   - Thay `localStorage.getItem('products')` → Redux `state.products`
   - Thay `localStorage.getItem('productAttributes')` → Redux `state.productAttributes`
   - Dispatch actions: `GET_PRODUCTS_REQUEST`, `CREATE_PRODUCT_REQUEST`, `UPDATE_PRODUCT_REQUEST`, `DELETE_PRODUCT_REQUEST`
   - Xử lý `_id` thay vì `id` cho MongoDB

2. **Orders.jsx:**
   - Thay `localStorage.getItem('orders')` → Redux `state.orders`
   - Dispatch actions: `GET_ORDERS_REQUEST`, `CREATE_ORDER_REQUEST`, `UPDATE_ORDER_REQUEST`, `DELETE_ORDER_REQUEST`, `DELETE_ORDERS_REQUEST`
   - Xử lý `_id` thay vì `id`

3. **Templates.jsx:**
   - Thay `localStorage.getItem('templates')` → Redux `state.templates`
   - Thay `localStorage.getItem('productAttributes')` → Redux `state.productAttributes`
   - Dispatch actions: `GET_TEMPLATES_REQUEST`, `CREATE_TEMPLATE_REQUEST`, `UPDATE_TEMPLATE_REQUEST`, `DELETE_TEMPLATE_REQUEST`
   - Xử lý `_id` thay vì `id`

4. **ToneAI.jsx:**
   - Thay `localStorage.getItem('customTones')` → Redux `state.tones`
   - Thay `localStorage.getItem('selectedTone')` → Có thể lưu trong Redux hoặc state local
   - Thay `localStorage.getItem('staffMembers')` → Có thể lưu trong Redux hoặc state local
   - Dispatch actions: `GET_TONES_REQUEST`, `CREATE_TONE_REQUEST`, `UPDATE_TONE_REQUEST`, `DELETE_TONE_REQUEST`
   - Xử lý `_id` thay vì `id`

5. **Settings.jsx:**
   - Thay `localStorage.getItem('shopInfo')` → Redux `state.settings`
   - Thay `localStorage.getItem('productAttributes')` → Redux `state.productAttributes`
   - Thay `localStorage.getItem('products')` → Redux `state.products`
   - Dispatch actions: `GET_SETTINGS_REQUEST`, `UPDATE_SETTINGS_REQUEST`
   - Xử lý `_id` thay vì `id`

6. **Shipping.jsx:**
   - Cần tạo reducer/saga cho Shipping hoặc dùng API trực tiếp
   - Thay `localStorage.getItem('shippingMethods')` → Redux hoặc API

7. **Promotions.jsx:**
   - Cần tạo reducer/saga cho Promotions hoặc dùng API trực tiếp
   - Thay `localStorage.getItem('promotions')` → Redux hoặc API

8. **Dashboard.jsx:**
   - Thay tất cả `localStorage.getItem()` → Redux selectors
   - Dùng `state.products`, `state.orders`, `state.promotions`, etc.

9. **Navbar.jsx:**
   - Thay `localStorage.getItem('notifications')` → Có thể lưu trong Redux hoặc state local

10. **Register.jsx:**
    - Đã dùng Redux từ trước (authSaga)

11. **ForgotPassword.jsx:**
    - Có thể cần cập nhật để dùng API thay vì localStorage

## 📝 Lưu ý khi cập nhật:

1. **Import Redux:**
   ```javascript
   import { useDispatch, useSelector } from 'react-redux'
   ```

2. **Thay localStorage:**
   ```javascript
   // Cũ:
   const [data, setData] = useState(JSON.parse(localStorage.getItem('key') || '[]'))
   
   // Mới:
   const dispatch = useDispatch()
   const { data, loading, error } = useSelector((state) => state.moduleName)
   
   useEffect(() => {
     dispatch({ type: 'GET_DATA_REQUEST' })
   }, [dispatch])
   ```

3. **Xử lý _id vs id:**
   ```javascript
   // Luôn dùng:
   const id = item._id || item.id
   ```

4. **Dispatch actions:**
   ```javascript
   // Create:
   dispatch({ type: 'CREATE_ITEM_REQUEST', payload: itemData })
   
   // Update:
   dispatch({ type: 'UPDATE_ITEM_REQUEST', payload: { id, itemData } })
   
   // Delete:
   dispatch({ type: 'DELETE_ITEM_REQUEST', payload: id })
   ```

5. **Xóa localStorage operations:**
   - Xóa tất cả `localStorage.setItem()` và `localStorage.getItem()` (trừ `token` và `user` cho auth)

## 🔧 Backend API cần có:

Tất cả các endpoints đã được định nghĩa trong `src/services/api.js`. Đảm bảo backend đã implement:
- `/api/product-attributes` (GET, POST, PUT, DELETE, PUT /order)
- `/api/products` (GET, POST, PUT, DELETE)
- `/api/orders` (GET, POST, PUT, DELETE, POST /bulk-delete)
- `/api/templates` (GET, POST, PUT, DELETE)
- `/api/tones` (GET, POST, PUT, DELETE)
- `/api/settings` (GET, PUT)
- `/api/faqs` (GET, POST, PUT, DELETE)
- `/api/users` (GET, POST, PUT, DELETE)



