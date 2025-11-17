import { call, put, takeEvery } from 'redux-saga/effects'
import { productsAPI } from '../../services/api'

function* getProductsSaga(action) {
  try {
    const response = yield call(productsAPI.getProducts, action.payload)
    yield put({ type: 'GET_PRODUCTS_SUCCESS', payload: response.data })
  } catch (error) {
    yield put({
      type: 'GET_PRODUCTS_FAILURE',
      payload: error.formattedMessage || error.response?.data?.message || 'Không thể tải danh sách sản phẩm',
    })
  }
}

function* createProductSaga(action) {
  try {
    const response = yield call(productsAPI.createProduct, action.payload)
    yield put({ type: 'CREATE_PRODUCT_SUCCESS', payload: response.data })
  } catch (error) {
    yield put({
      type: 'CREATE_PRODUCT_FAILURE',
      payload: error.formattedMessage || error.response?.data?.message || 'Không thể tạo sản phẩm',
    })
  }
}

function* updateProductSaga(action) {
  try {
    const { id, productData } = action.payload
    const response = yield call(productsAPI.updateProduct, id, productData)
    yield put({ type: 'UPDATE_PRODUCT_SUCCESS', payload: response.data })
  } catch (error) {
    yield put({
      type: 'UPDATE_PRODUCT_FAILURE',
      payload: error.formattedMessage || error.response?.data?.message || 'Không thể cập nhật sản phẩm',
    })
  }
}

function* deleteProductSaga(action) {
  try {
    yield call(productsAPI.deleteProduct, action.payload)
    yield put({ type: 'DELETE_PRODUCT_SUCCESS', payload: action.payload })
  } catch (error) {
    yield put({
      type: 'DELETE_PRODUCT_FAILURE',
      payload: error.formattedMessage || error.response?.data?.message || 'Không thể xóa sản phẩm',
    })
  }
}

export default function* productSaga() {
  yield takeEvery('GET_PRODUCTS_REQUEST', getProductsSaga)
  yield takeEvery('CREATE_PRODUCT_REQUEST', createProductSaga)
  yield takeEvery('UPDATE_PRODUCT_REQUEST', updateProductSaga)
  yield takeEvery('DELETE_PRODUCT_REQUEST', deleteProductSaga)
}

