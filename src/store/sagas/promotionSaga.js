import { call, put, takeEvery } from 'redux-saga/effects'
import { promotionsAPI } from '../../services/api'

function* getPromotionsSaga() {
  try {
    const response = yield call(promotionsAPI.getPromotions)
    yield put({ type: 'GET_PROMOTIONS_SUCCESS', payload: response.data })
  } catch (error) {
    yield put({
      type: 'GET_PROMOTIONS_FAILURE',
      payload: error.formattedMessage || error.response?.data?.message || 'Không thể tải danh sách khuyến mãi',
    })
  }
}

function* createPromotionSaga(action) {
  try {
    const response = yield call(promotionsAPI.createPromotion, action.payload)
    yield put({ type: 'CREATE_PROMOTION_SUCCESS', payload: response.data })
    yield put({ type: 'GET_ACTIVITY_LOGS_REQUEST', payload: { limit: 20 } }) // Refresh activity logs
  } catch (error) {
    yield put({
      type: 'CREATE_PROMOTION_FAILURE',
      payload: error.formattedMessage || error.response?.data?.message || 'Không thể tạo khuyến mãi',
    })
  }
}

function* updatePromotionSaga(action) {
  try {
    const { id, promotionData } = action.payload
    const response = yield call(promotionsAPI.updatePromotion, id, promotionData)
    yield put({ type: 'UPDATE_PROMOTION_SUCCESS', payload: response.data })
    yield put({ type: 'GET_ACTIVITY_LOGS_REQUEST', payload: { limit: 20 } }) // Refresh activity logs
  } catch (error) {
    yield put({
      type: 'UPDATE_PROMOTION_FAILURE',
      payload: error.formattedMessage || error.response?.data?.message || 'Không thể cập nhật khuyến mãi',
    })
  }
}

function* deletePromotionSaga(action) {
  try {
    yield call(promotionsAPI.deletePromotion, action.payload)
    yield put({ type: 'DELETE_PROMOTION_SUCCESS', payload: action.payload })
    yield put({ type: 'GET_ACTIVITY_LOGS_REQUEST', payload: { limit: 20 } }) // Refresh activity logs
  } catch (error) {
    yield put({
      type: 'DELETE_PROMOTION_FAILURE',
      payload: error.formattedMessage || error.response?.data?.message || 'Không thể xóa khuyến mãi',
    })
  }
}

export default function* promotionSaga() {
  yield takeEvery('GET_PROMOTIONS_REQUEST', getPromotionsSaga)
  yield takeEvery('CREATE_PROMOTION_REQUEST', createPromotionSaga)
  yield takeEvery('UPDATE_PROMOTION_REQUEST', updatePromotionSaga)
  yield takeEvery('DELETE_PROMOTION_REQUEST', deletePromotionSaga)
}



