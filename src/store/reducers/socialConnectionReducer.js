const initialState = {
  connections: [],
  loading: false,
  error: null,
}

const socialConnectionReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'GET_SOCIAL_CONNECTIONS_REQUEST':
    case 'CONNECT_SOCIAL_REQUEST':
    case 'DISCONNECT_SOCIAL_REQUEST':
      return {
        ...state,
        loading: true,
        error: null,
      }
    case 'GET_SOCIAL_CONNECTIONS_SUCCESS':
      return {
        ...state,
        connections: action.payload,
        loading: false,
        error: null,
      }
    case 'CONNECT_SOCIAL_SUCCESS':
      return {
        ...state,
        connections: state.connections.map((conn) =>
          conn.platform === action.payload.platform ? action.payload : conn
        ),
        loading: false,
        error: null,
      }
    case 'DISCONNECT_SOCIAL_SUCCESS':
      return {
        ...state,
        connections: state.connections.map((conn) =>
          conn.platform === action.payload.platform ? action.payload : conn
        ),
        loading: false,
        error: null,
      }
    case 'GET_SOCIAL_CONNECTIONS_FAILURE':
    case 'CONNECT_SOCIAL_FAILURE':
    case 'DISCONNECT_SOCIAL_FAILURE':
      return {
        ...state,
        loading: false,
        error: action.payload,
      }
    default:
      return state
  }
}

export default socialConnectionReducer



