import { call, put, takeEvery } from 'redux-saga/effects'
import { templatesAPI } from '../../services/api'

function* getTemplatesSaga() {
  try {
    const response = yield call(templatesAPI.getTemplates)
    yield put({ type: 'GET_TEMPLATES_SUCCESS', payload: response.data })
  } catch (error) {
    yield put({
      type: 'GET_TEMPLATES_FAILURE',
      payload: error.formattedMessage || error.response?.data?.message || 'Không thể tải danh sách template',
    })
  }
}

function* createTemplateSaga(action) {
  try {
    const response = yield call(templatesAPI.createTemplate, action.payload)
    yield put({ type: 'CREATE_TEMPLATE_SUCCESS', payload: response.data })
  } catch (error) {
    yield put({
      type: 'CREATE_TEMPLATE_FAILURE',
      payload: error.formattedMessage || error.response?.data?.message || 'Không thể tạo template',
    })
  }
}

function* updateTemplateSaga(action) {
  try {
    const { id, templateData } = action.payload
    const response = yield call(templatesAPI.updateTemplate, id, templateData)
    yield put({ type: 'UPDATE_TEMPLATE_SUCCESS', payload: response.data })
  } catch (error) {
    yield put({
      type: 'UPDATE_TEMPLATE_FAILURE',
      payload: error.formattedMessage || error.response?.data?.message || 'Không thể cập nhật template',
    })
  }
}

function* deleteTemplateSaga(action) {
  try {
    yield call(templatesAPI.deleteTemplate, action.payload)
    yield put({ type: 'DELETE_TEMPLATE_SUCCESS', payload: action.payload })
  } catch (error) {
    yield put({
      type: 'DELETE_TEMPLATE_FAILURE',
      payload: error.formattedMessage || error.response?.data?.message || 'Không thể xóa template',
    })
  }
}

export default function* templateSaga() {
  yield takeEvery('GET_TEMPLATES_REQUEST', getTemplatesSaga)
  yield takeEvery('CREATE_TEMPLATE_REQUEST', createTemplateSaga)
  yield takeEvery('UPDATE_TEMPLATE_REQUEST', updateTemplateSaga)
  yield takeEvery('DELETE_TEMPLATE_REQUEST', deleteTemplateSaga)
}

