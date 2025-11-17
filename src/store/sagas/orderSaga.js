import { call, put, takeEvery } from 'redux-saga/effects'
import { ordersAPI } from '../../services/api'

function* getOrdersSaga(action) {
  try {
    const response = yield call(ordersAPI.getOrders, action.payload)
    yield put({ type: 'GET_ORDERS_SUCCESS', payload: response.data })
  } catch (error) {
    yield put({
      type: 'GET_ORDERS_FAILURE',
      payload: error.formattedMessage || error.response?.data?.message || 'Không thể tải danh sách đơn hàng',
    })
  }
}

function* createOrderSaga(action) {
  try {
    const response = yield call(ordersAPI.createOrder, action.payload)
    yield put({ type: 'CREATE_ORDER_SUCCESS', payload: response.data })
  } catch (error) {
    yield put({
      type: 'CREATE_ORDER_FAILURE',
      payload: error.formattedMessage || error.response?.data?.message || 'Không thể tạo đơn hàng',
    })
  }
}

function* updateOrderSaga(action) {
  try {
    const { id, orderData } = action.payload
    const response = yield call(ordersAPI.updateOrder, id, orderData)
    yield put({ type: 'UPDATE_ORDER_SUCCESS', payload: response.data })
  } catch (error) {
    yield put({
      type: 'UPDATE_ORDER_FAILURE',
      payload: error.formattedMessage || error.response?.data?.message || 'Không thể cập nhật đơn hàng',
    })
  }
}

function* deleteOrderSaga(action) {
  try {
    yield call(ordersAPI.deleteOrder, action.payload)
    yield put({ type: 'DELETE_ORDER_SUCCESS', payload: action.payload })
  } catch (error) {
    yield put({
      type: 'DELETE_ORDER_FAILURE',
      payload: error.formattedMessage || error.response?.data?.message || 'Không thể xóa đơn hàng',
    })
  }
}

function* deleteOrdersSaga(action) {
  try {
    yield call(ordersAPI.deleteOrders, action.payload)
    yield put({ type: 'DELETE_ORDERS_SUCCESS', payload: action.payload })
  } catch (error) {
    yield put({
      type: 'DELETE_ORDERS_FAILURE',
      payload: error.formattedMessage || error.response?.data?.message || 'Không thể xóa đơn hàng',
    })
  }
}

export default function* orderSaga() {
  yield takeEvery('GET_ORDERS_REQUEST', getOrdersSaga)
  yield takeEvery('CREATE_ORDER_REQUEST', createOrderSaga)
  yield takeEvery('UPDATE_ORDER_REQUEST', updateOrderSaga)
  yield takeEvery('DELETE_ORDER_REQUEST', deleteOrderSaga)
  yield takeEvery('DELETE_ORDERS_REQUEST', deleteOrdersSaga)
}

