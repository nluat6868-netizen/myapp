import { call, put, takeEvery } from 'redux-saga/effects'
import { socialConnectionsAPI } from '../../services/api'

function* getSocialConnectionsSaga() {
  try {
    const response = yield call(socialConnectionsAPI.getSocialConnections)
    yield put({ type: 'GET_SOCIAL_CONNECTIONS_SUCCESS', payload: response.data })
  } catch (error) {
    yield put({
      type: 'GET_SOCIAL_CONNECTIONS_FAILURE',
      payload: error.formattedMessage || error.response?.data?.message || 'Không thể tải danh sách kết nối',
    })
  }
}

function* connectSocialPlatformSaga(action) {
  try {
    const { platform } = action.payload
    const response = yield call(socialConnectionsAPI.connectSocialPlatform, platform)
    yield put({ type: 'CONNECT_SOCIAL_SUCCESS', payload: response.data })
    
    // Open OAuth URL in new window
    if (response.data.authUrl) {
      window.open(response.data.authUrl, '_blank', 'width=600,height=700')
    }
  } catch (error) {
    yield put({
      type: 'CONNECT_SOCIAL_FAILURE',
      payload: error.formattedMessage || error.response?.data?.message || 'Không thể kết nối',
    })
  }
}

function* handleSocialCallbackSaga(action) {
  try {
    const { platform, data } = action.payload
    const response = yield call(socialConnectionsAPI.handleSocialCallback, platform, data)
    yield put({ type: 'CONNECT_SOCIAL_SUCCESS', payload: response.data })
  } catch (error) {
    yield put({
      type: 'CONNECT_SOCIAL_FAILURE',
      payload: error.formattedMessage || error.response?.data?.message || 'Không thể xử lý callback',
    })
  }
}

function* disconnectSocialPlatformSaga(action) {
  try {
    const { platform } = action.payload
    const response = yield call(socialConnectionsAPI.disconnectSocialPlatform, platform)
    yield put({ type: 'DISCONNECT_SOCIAL_SUCCESS', payload: response.data })
  } catch (error) {
    yield put({
      type: 'DISCONNECT_SOCIAL_FAILURE',
      payload: error.formattedMessage || error.response?.data?.message || 'Không thể ngắt kết nối',
    })
  }
}

export default function* socialConnectionSaga() {
  yield takeEvery('GET_SOCIAL_CONNECTIONS_REQUEST', getSocialConnectionsSaga)
  yield takeEvery('CONNECT_SOCIAL_REQUEST', connectSocialPlatformSaga)
  yield takeEvery('HANDLE_SOCIAL_CALLBACK_REQUEST', handleSocialCallbackSaga)
  yield takeEvery('DISCONNECT_SOCIAL_REQUEST', disconnectSocialPlatformSaga)
}




