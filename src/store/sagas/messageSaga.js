import { call, put, takeEvery } from 'redux-saga/effects'
import { messagesAPI } from '../../services/api'

function* getConversationsSaga(action) {
  try {
    const response = yield call(messagesAPI.getConversations, action.payload)
    yield put({ type: 'GET_CONVERSATIONS_SUCCESS', payload: response.data })
  } catch (error) {
    yield put({
      type: 'GET_CONVERSATIONS_FAILURE',
      payload: error.formattedMessage || error.response?.data?.message || 'Không thể tải danh sách cuộc trò chuyện',
    })
  }
}

function* getConversationSaga(action) {
  try {
    const response = yield call(messagesAPI.getConversation, action.payload)
    yield put({ type: 'GET_CONVERSATION_SUCCESS', payload: response.data })
  } catch (error) {
    yield put({
      type: 'GET_CONVERSATION_FAILURE',
      payload: error.formattedMessage || error.response?.data?.message || 'Không thể tải cuộc trò chuyện',
    })
  }
}

function* createConversationSaga(action) {
  try {
    const response = yield call(messagesAPI.createConversation, action.payload)
    yield put({ type: 'CREATE_CONVERSATION_SUCCESS', payload: response.data })
  } catch (error) {
    yield put({
      type: 'CREATE_CONVERSATION_FAILURE',
      payload: error.formattedMessage || error.response?.data?.message || 'Không thể tạo cuộc trò chuyện',
    })
  }
}

function* updateConversationSaga(action) {
  try {
    const { id, conversationData } = action.payload
    const response = yield call(messagesAPI.updateConversation, id, conversationData)
    yield put({ type: 'UPDATE_CONVERSATION_SUCCESS', payload: response.data })
  } catch (error) {
    yield put({
      type: 'UPDATE_CONVERSATION_FAILURE',
      payload: error.formattedMessage || error.response?.data?.message || 'Không thể cập nhật cuộc trò chuyện',
    })
  }
}

function* deleteConversationSaga(action) {
  try {
    yield call(messagesAPI.deleteConversation, action.payload)
    yield put({ type: 'DELETE_CONVERSATION_SUCCESS', payload: action.payload })
  } catch (error) {
    yield put({
      type: 'DELETE_CONVERSATION_FAILURE',
      payload: error.formattedMessage || error.response?.data?.message || 'Không thể xóa cuộc trò chuyện',
    })
  }
}

function* createMessageSaga(action) {
  try {
    // Convert frontend sender format to backend format
    const backendPayload = {
      ...action.payload,
      sender: action.payload.sender === 'me' ? 'user' : 'customer',
    }
    const response = yield call(messagesAPI.createMessage, backendPayload)
    yield put({
      type: 'CREATE_MESSAGE_SUCCESS',
      payload: {
        ...response.data,
        conversationId: action.payload.conversationId,
      },
    })
  } catch (error) {
    yield put({
      type: 'CREATE_MESSAGE_FAILURE',
      payload: error.formattedMessage || error.response?.data?.message || 'Không thể gửi tin nhắn',
    })
  }
}

function* updateMessageSaga(action) {
  try {
    const { id, messageData } = action.payload
    const response = yield call(messagesAPI.updateMessage, id, messageData)
    yield put({ type: 'UPDATE_MESSAGE_SUCCESS', payload: response.data })
  } catch (error) {
    yield put({
      type: 'UPDATE_MESSAGE_FAILURE',
      payload: error.formattedMessage || error.response?.data?.message || 'Không thể cập nhật tin nhắn',
    })
  }
}

function* deleteMessageSaga(action) {
  try {
    yield call(messagesAPI.deleteMessage, action.payload)
    yield put({ type: 'DELETE_MESSAGE_SUCCESS', payload: action.payload })
  } catch (error) {
    yield put({
      type: 'DELETE_MESSAGE_FAILURE',
      payload: error.formattedMessage || error.response?.data?.message || 'Không thể xóa tin nhắn',
    })
  }
}

function* getMessageStatsSaga(action) {
  try {
    const response = yield call(messagesAPI.getMessageStats, action.payload)
    yield put({ type: 'GET_MESSAGE_STATS_SUCCESS', payload: response.data })
  } catch (error) {
    yield put({
      type: 'GET_MESSAGE_STATS_FAILURE',
      payload: error.formattedMessage || error.response?.data?.message || 'Không thể tải thống kê',
    })
  }
}

export default function* messageSaga() {
  yield takeEvery('GET_CONVERSATIONS_REQUEST', getConversationsSaga)
  yield takeEvery('GET_CONVERSATION_REQUEST', getConversationSaga)
  yield takeEvery('CREATE_CONVERSATION_REQUEST', createConversationSaga)
  yield takeEvery('UPDATE_CONVERSATION_REQUEST', updateConversationSaga)
  yield takeEvery('DELETE_CONVERSATION_REQUEST', deleteConversationSaga)
  yield takeEvery('CREATE_MESSAGE_REQUEST', createMessageSaga)
  yield takeEvery('UPDATE_MESSAGE_REQUEST', updateMessageSaga)
  yield takeEvery('DELETE_MESSAGE_REQUEST', deleteMessageSaga)
  yield takeEvery('GET_MESSAGE_STATS_REQUEST', getMessageStatsSaga)
}

