import { call, put, takeEvery } from 'redux-saga/effects'
import { faqsAPI } from '../../services/api'

function* getFAQsSaga() {
  try {
    const response = yield call(faqsAPI.getFAQs)
    yield put({ type: 'GET_FAQS_SUCCESS', payload: response.data })
  } catch (error) {
    yield put({
      type: 'GET_FAQS_FAILURE',
      payload: error.formattedMessage || error.response?.data?.message || 'Không thể tải danh sách FAQ',
    })
  }
}

function* createFAQSaga(action) {
  try {
    const response = yield call(faqsAPI.createFAQ, action.payload)
    yield put({ type: 'CREATE_FAQ_SUCCESS', payload: response.data })
  } catch (error) {
    yield put({
      type: 'CREATE_FAQ_FAILURE',
      payload: error.formattedMessage || error.response?.data?.message || 'Không thể tạo FAQ',
    })
  }
}

function* updateFAQSaga(action) {
  try {
    const { id, faqData } = action.payload
    const response = yield call(faqsAPI.updateFAQ, id, faqData)
    yield put({ type: 'UPDATE_FAQ_SUCCESS', payload: response.data })
  } catch (error) {
    yield put({
      type: 'UPDATE_FAQ_FAILURE',
      payload: error.formattedMessage || error.response?.data?.message || 'Không thể cập nhật FAQ',
    })
  }
}

function* deleteFAQSaga(action) {
  try {
    yield call(faqsAPI.deleteFAQ, action.payload)
    yield put({ type: 'DELETE_FAQ_SUCCESS', payload: action.payload })
  } catch (error) {
    yield put({
      type: 'DELETE_FAQ_FAILURE',
      payload: error.formattedMessage || error.response?.data?.message || 'Không thể xóa FAQ',
    })
  }
}

export default function* faqSaga() {
  yield takeEvery('GET_FAQS_REQUEST', getFAQsSaga)
  yield takeEvery('CREATE_FAQ_REQUEST', createFAQSaga)
  yield takeEvery('UPDATE_FAQ_REQUEST', updateFAQSaga)
  yield takeEvery('DELETE_FAQ_REQUEST', deleteFAQSaga)
}

