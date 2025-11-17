import { call, put, takeEvery } from 'redux-saga/effects'
import { settingsAPI } from '../../services/api'

function* getSettingsSaga() {
  try {
    const response = yield call(settingsAPI.getSettings)
    // Ensure we always have a valid settings object
    const settings = response.data || {}
    yield put({ type: 'GET_SETTINGS_SUCCESS', payload: settings })
  } catch (error) {
    console.error('Get settings error:', error)
    yield put({
      type: 'GET_SETTINGS_FAILURE',
      payload: error.formattedMessage || error.response?.data?.message || 'Không thể tải cài đặt',
    })
  }
}

function* updateSettingsSaga(action) {
  try {
    const response = yield call(settingsAPI.updateSettings, action.payload)
    yield put({ type: 'UPDATE_SETTINGS_SUCCESS', payload: response.data })
  } catch (error) {
    yield put({
      type: 'UPDATE_SETTINGS_FAILURE',
      payload: error.formattedMessage || error.response?.data?.message || 'Không thể cập nhật cài đặt',
    })
  }
}

export default function* settingsSaga() {
  yield takeEvery('GET_SETTINGS_REQUEST', getSettingsSaga)
  yield takeEvery('UPDATE_SETTINGS_REQUEST', updateSettingsSaga)
}

