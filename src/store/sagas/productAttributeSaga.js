import { call, put, takeEvery } from 'redux-saga/effects'
import { productAttributesAPI } from '../../services/api'

function* getAttributesSaga() {
  try {
    const response = yield call(productAttributesAPI.getAttributes)
    yield put({ type: 'GET_ATTRIBUTES_SUCCESS', payload: response.data })
  } catch (error) {
    yield put({
      type: 'GET_ATTRIBUTES_FAILURE',
      payload: error.formattedMessage || error.response?.data?.message || 'Không thể tải danh sách thuộc tính',
    })
  }
}

function* createAttributeSaga(action) {
  try {
    const response = yield call(productAttributesAPI.createAttribute, action.payload)
    yield put({ type: 'CREATE_ATTRIBUTE_SUCCESS', payload: response.data })
  } catch (error) {
    yield put({
      type: 'CREATE_ATTRIBUTE_FAILURE',
      payload: error.formattedMessage || error.response?.data?.message || 'Không thể tạo thuộc tính',
    })
  }
}

function* updateAttributeSaga(action) {
  try {
    const { id, attributeData } = action.payload
    const response = yield call(productAttributesAPI.updateAttribute, id, attributeData)
    yield put({ type: 'UPDATE_ATTRIBUTE_SUCCESS', payload: response.data })
  } catch (error) {
    yield put({
      type: 'UPDATE_ATTRIBUTE_FAILURE',
      payload: error.formattedMessage || error.response?.data?.message || 'Không thể cập nhật thuộc tính',
    })
  }
}

function* deleteAttributeSaga(action) {
  try {
    yield call(productAttributesAPI.deleteAttribute, action.payload)
    yield put({ type: 'DELETE_ATTRIBUTE_SUCCESS', payload: action.payload })
  } catch (error) {
    yield put({
      type: 'DELETE_ATTRIBUTE_FAILURE',
      payload: error.formattedMessage || error.response?.data?.message || 'Không thể xóa thuộc tính',
    })
  }
}

function* updateAttributeOrderSaga(action) {
  try {
    const response = yield call(productAttributesAPI.updateAttributeOrder, action.payload)
    yield put({ type: 'UPDATE_ATTRIBUTE_ORDER_SUCCESS', payload: response.data })
  } catch (error) {
    yield put({
      type: 'UPDATE_ATTRIBUTE_ORDER_FAILURE',
      payload: error.formattedMessage || error.response?.data?.message || 'Không thể cập nhật thứ tự thuộc tính',
    })
  }
}

export default function* productAttributeSaga() {
  yield takeEvery('GET_ATTRIBUTES_REQUEST', getAttributesSaga)
  yield takeEvery('CREATE_ATTRIBUTE_REQUEST', createAttributeSaga)
  yield takeEvery('UPDATE_ATTRIBUTE_REQUEST', updateAttributeSaga)
  yield takeEvery('DELETE_ATTRIBUTE_REQUEST', deleteAttributeSaga)
  yield takeEvery('UPDATE_ATTRIBUTE_ORDER_REQUEST', updateAttributeOrderSaga)
}

