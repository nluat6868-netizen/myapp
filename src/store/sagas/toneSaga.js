import { call, put, takeEvery } from 'redux-saga/effects'
import { tonesAPI } from '../../services/api'

function* getTonesSaga() {
  try {
    const response = yield call(tonesAPI.getTones)
    yield put({ type: 'GET_TONES_SUCCESS', payload: response.data })
  } catch (error) {
    yield put({
      type: 'GET_TONES_FAILURE',
      payload: error.formattedMessage || error.response?.data?.message || 'Không thể tải danh sách tone',
    })
  }
}

function* createToneSaga(action) {
  try {
    const response = yield call(tonesAPI.createTone, action.payload)
    yield put({ type: 'CREATE_TONE_SUCCESS', payload: response.data })
  } catch (error) {
    yield put({
      type: 'CREATE_TONE_FAILURE',
      payload: error.formattedMessage || error.response?.data?.message || 'Không thể tạo tone',
    })
  }
}

function* updateToneSaga(action) {
  try {
    const { id, toneData } = action.payload
    const response = yield call(tonesAPI.updateTone, id, toneData)
    yield put({ type: 'UPDATE_TONE_SUCCESS', payload: response.data })
  } catch (error) {
    yield put({
      type: 'UPDATE_TONE_FAILURE',
      payload: error.formattedMessage || error.response?.data?.message || 'Không thể cập nhật tone',
    })
  }
}

function* deleteToneSaga(action) {
  try {
    yield call(tonesAPI.deleteTone, action.payload)
    yield put({ type: 'DELETE_TONE_SUCCESS', payload: action.payload })
  } catch (error) {
    yield put({
      type: 'DELETE_TONE_FAILURE',
      payload: error.formattedMessage || error.response?.data?.message || 'Không thể xóa tone',
    })
  }
}

export default function* toneSaga() {
  yield takeEvery('GET_TONES_REQUEST', getTonesSaga)
  yield takeEvery('CREATE_TONE_REQUEST', createToneSaga)
  yield takeEvery('UPDATE_TONE_REQUEST', updateToneSaga)
  yield takeEvery('DELETE_TONE_REQUEST', deleteToneSaga)
}

