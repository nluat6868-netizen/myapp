import { call, put, takeEvery } from 'redux-saga/effects'
import { socialPostsAPI } from '../../services/api'

function* publishPostSaga(action) {
  try {
    const response = yield call(socialPostsAPI.publishPost, action.payload)
    yield put({ type: 'PUBLISH_SOCIAL_POST_SUCCESS', payload: response.data })
  } catch (error) {
    yield put({
      type: 'PUBLISH_SOCIAL_POST_FAILURE',
      payload: error.formattedMessage || error.response?.data?.message || 'Không thể đăng bài',
    })
  }
}

export default function* socialPostSaga() {
  yield takeEvery('PUBLISH_SOCIAL_POST_REQUEST', publishPostSaga)
}



