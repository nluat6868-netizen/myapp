const initialState = {
  tickets: [],
  ticket: null,
  loading: false,
  error: null,
}

const ticketReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'GET_TICKETS_REQUEST':
    case 'CREATE_TICKET_REQUEST':
    case 'UPDATE_TICKET_REQUEST':
    case 'DELETE_TICKET_REQUEST':
    case 'GET_TICKET_REQUEST':
      return {
        ...state,
        loading: true,
        error: null,
      }
    case 'GET_TICKETS_SUCCESS':
      return {
        ...state,
        tickets: action.payload,
        loading: false,
        error: null,
      }
    case 'GET_TICKET_SUCCESS':
      return {
        ...state,
        ticket: action.payload,
        loading: false,
        error: null,
      }
    case 'CREATE_TICKET_SUCCESS':
      return {
        ...state,
        tickets: [action.payload, ...state.tickets],
        loading: false,
        error: null,
      }
    case 'UPDATE_TICKET_SUCCESS':
      return {
        ...state,
        tickets: state.tickets.map((ticket) =>
          ticket._id === action.payload._id ? action.payload : ticket
        ),
        ticket: state.ticket?._id === action.payload._id ? action.payload : state.ticket,
        loading: false,
        error: null,
      }
    case 'DELETE_TICKET_SUCCESS':
      return {
        ...state,
        tickets: state.tickets.filter((ticket) => ticket._id !== action.payload),
        ticket: state.ticket?._id === action.payload ? null : state.ticket,
        loading: false,
        error: null,
      }
    case 'GET_TICKETS_FAILURE':
    case 'CREATE_TICKET_FAILURE':
    case 'UPDATE_TICKET_FAILURE':
    case 'DELETE_TICKET_FAILURE':
    case 'GET_TICKET_FAILURE':
      return {
        ...state,
        loading: false,
        error: action.payload,
      }
    default:
      return state
  }
}

export default ticketReducer




