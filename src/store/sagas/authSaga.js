import { call, put, takeEvery } from 'redux-saga/effects'
import { authAPI } from '../../services/api'

function* loginSaga(action) {
  try {
    // Clear all localStorage data before login to prevent data leakage between users
    const dataKeys = [
      'products',
      'orders',
      'promotions',
      'shipping',
      'faqs',
      'templates',
      'tones',
      'productAttributes',
      'readActivityLogs',
    ]
    dataKeys.forEach((key) => localStorage.removeItem(key))

    const response = yield call(authAPI.login, action.payload)
    const { token, ...user } = response.data

    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))

    yield put({ type: 'LOGIN_SUCCESS', payload: { user, token } })
  } catch (error) {
    yield put({
      type: 'LOGIN_FAILURE',
      payload: error.formattedMessage || error.response?.data?.message || 'Đăng nhập thất bại',
    })
  }
}

function* registerSaga(action) {
  try {
    const response = yield call(authAPI.register, action.payload)
    const { token, ...user } = response.data

    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))

    yield put({ type: 'REGISTER_SUCCESS', payload: { user, token } })
  } catch (error) {
    yield put({
      type: 'REGISTER_FAILURE',
      payload: error.formattedMessage || error.response?.data?.message || 'Đăng ký thất bại',
    })
  }
}

function* getMeSaga() {
  try {
    const response = yield call(authAPI.getMe)
    yield put({ type: 'GET_ME_SUCCESS', payload: response.data })
  } catch (error) {
    console.error('Get me error:', error)
  }
}

function* logoutSaga() {
  // Clear all localStorage data to prevent data leakage
  const dataKeys = [
    'token',
    'user',
    'products',
    'orders',
    'promotions',
    'shipping',
    'faqs',
    'templates',
    'tones',
    'productAttributes',
    'readActivityLogs',
  ]
  dataKeys.forEach((key) => localStorage.removeItem(key))
  
  yield put({ type: 'LOGOUT' })
}

export default function* authSaga() {
  yield takeEvery('LOGIN_REQUEST', loginSaga)
  yield takeEvery('REGISTER_REQUEST', registerSaga)
  yield takeEvery('GET_ME_REQUEST', getMeSaga)
  yield takeEvery('LOGOUT_REQUEST', logoutSaga)
}

