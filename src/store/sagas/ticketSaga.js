import { call, put, takeEvery } from 'redux-saga/effects'
import { ticketsAPI } from '../../services/api'

function* getTicketsSaga(action) {
  try {
    const response = yield call(ticketsAPI.getTickets, action.payload)
    yield put({ type: 'GET_TICKETS_SUCCESS', payload: response.data })
  } catch (error) {
    yield put({
      type: 'GET_TICKETS_FAILURE',
      payload: error.formattedMessage || error.response?.data?.message || 'Không thể tải danh sách tickets',
    })
  }
}

function* getTicketByIdSaga(action) {
  try {
    const response = yield call(ticketsAPI.getTicketById, action.payload)
    yield put({ type: 'GET_TICKET_SUCCESS', payload: response.data })
  } catch (error) {
    yield put({
      type: 'GET_TICKET_FAILURE',
      payload: error.formattedMessage || error.response?.data?.message || 'Không thể tải thông tin ticket',
    })
  }
}

function* createTicketSaga(action) {
  try {
    const response = yield call(ticketsAPI.createTicket, action.payload)
    yield put({ type: 'CREATE_TICKET_SUCCESS', payload: response.data })
  } catch (error) {
    yield put({
      type: 'CREATE_TICKET_FAILURE',
      payload: error.formattedMessage || error.response?.data?.message || 'Không thể tạo ticket',
    })
  }
}

function* updateTicketSaga(action) {
  try {
    const { id, ticketData } = action.payload
    const response = yield call(ticketsAPI.updateTicket, id, ticketData)
    yield put({ type: 'UPDATE_TICKET_SUCCESS', payload: response.data })
  } catch (error) {
    yield put({
      type: 'UPDATE_TICKET_FAILURE',
      payload: error.formattedMessage || error.response?.data?.message || 'Không thể cập nhật ticket',
    })
  }
}

function* deleteTicketSaga(action) {
  try {
    yield call(ticketsAPI.deleteTicket, action.payload)
    yield put({ type: 'DELETE_TICKET_SUCCESS', payload: action.payload })
  } catch (error) {
    yield put({
      type: 'DELETE_TICKET_FAILURE',
      payload: error.formattedMessage || error.response?.data?.message || 'Không thể xóa ticket',
    })
  }
}

function* addCommentSaga(action) {
  try {
    const { id, comment } = action.payload
    const response = yield call(ticketsAPI.addComment, id, comment)
    yield put({ type: 'UPDATE_TICKET_SUCCESS', payload: response.data })
  } catch (error) {
    yield put({
      type: 'UPDATE_TICKET_FAILURE',
      payload: error.formattedMessage || error.response?.data?.message || 'Không thể thêm bình luận',
    })
  }
}

export default function* ticketSaga() {
  yield takeEvery('GET_TICKETS_REQUEST', getTicketsSaga)
  yield takeEvery('GET_TICKET_REQUEST', getTicketByIdSaga)
  yield takeEvery('CREATE_TICKET_REQUEST', createTicketSaga)
  yield takeEvery('UPDATE_TICKET_REQUEST', updateTicketSaga)
  yield takeEvery('DELETE_TICKET_REQUEST', deleteTicketSaga)
  yield takeEvery('ADD_COMMENT_REQUEST', addCommentSaga)
}



