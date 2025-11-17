import { call, put, takeEvery } from 'redux-saga/effects'
import { activityLogsAPI } from '../../services/api'

function* getActivityLogsSaga(action) {
  try {
    const response = yield call(activityLogsAPI.getActivityLogs, action.payload)
    yield put({ type: 'GET_ACTIVITY_LOGS_SUCCESS', payload: response.data })
  } catch (error) {
    yield put({
      type: 'GET_ACTIVITY_LOGS_FAILURE',
      payload: error.formattedMessage || error.response?.data?.message || 'Không thể tải lịch sử hoạt động',
    })
  }
}

function* getActivityStatsSaga() {
  try {
    const response = yield call(activityLogsAPI.getActivityStats)
    yield put({ type: 'GET_ACTIVITY_STATS_SUCCESS', payload: response.data })
  } catch (error) {
    yield put({
      type: 'GET_ACTIVITY_STATS_FAILURE',
      payload: error.formattedMessage || error.response?.data?.message || 'Không thể tải thống kê hoạt động',
    })
  }
}

export default function* activityLogSaga() {
  yield takeEvery('GET_ACTIVITY_LOGS_REQUEST', getActivityLogsSaga)
  yield takeEvery('GET_ACTIVITY_STATS_REQUEST', getActivityStatsSaga)
}




