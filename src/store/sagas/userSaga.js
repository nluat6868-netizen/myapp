import { call, put, takeEvery } from 'redux-saga/effects'
import { usersAPI } from '../../services/api'

function* getUsersSaga() {
  try {
    const response = yield call(usersAPI.getUsers)
    yield put({ type: 'GET_USERS_SUCCESS', payload: response.data })
  } catch (error) {
    yield put({
      type: 'GET_USERS_FAILURE',
      payload: error.formattedMessage || error.response?.data?.message || 'Không thể tải danh sách người dùng',
    })
  }
}

function* createUserSaga(action) {
  try {
    const response = yield call(usersAPI.createUser, action.payload)
    yield put({ type: 'CREATE_USER_SUCCESS', payload: response.data })
  } catch (error) {
    yield put({
      type: 'CREATE_USER_FAILURE',
      payload: error.formattedMessage || error.response?.data?.message || 'Không thể tạo người dùng',
    })
  }
}

function* updateUserSaga(action) {
  try {
    const { id, userData } = action.payload
    const response = yield call(usersAPI.updateUser, id, userData)
    yield put({ type: 'UPDATE_USER_SUCCESS', payload: response.data })
  } catch (error) {
    yield put({
      type: 'UPDATE_USER_FAILURE',
      payload: error.formattedMessage || error.response?.data?.message || 'Không thể cập nhật người dùng',
    })
  }
}

function* deleteUserSaga(action) {
  try {
    yield call(usersAPI.deleteUser, action.payload)
    yield put({ type: 'DELETE_USER_SUCCESS', payload: action.payload })
  } catch (error) {
    yield put({
      type: 'DELETE_USER_FAILURE',
      payload: error.formattedMessage || error.response?.data?.message || 'Không thể xóa người dùng',
    })
  }
}

export default function* userSaga() {
  yield takeEvery('GET_USERS_REQUEST', getUsersSaga)
  yield takeEvery('CREATE_USER_REQUEST', createUserSaga)
  yield takeEvery('UPDATE_USER_REQUEST', updateUserSaga)
  yield takeEvery('DELETE_USER_REQUEST', deleteUserSaga)
}

