const initialState = {
  orders: [],
  totalPages: 1,
  currentPage: 1,
  total: 0,
  loading: false,
  error: null,
}

const orderReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'GET_ORDERS_REQUEST':
    case 'CREATE_ORDER_REQUEST':
    case 'UPDATE_ORDER_REQUEST':
    case 'DELETE_ORDER_REQUEST':
    case 'DELETE_ORDERS_REQUEST':
      return { ...state, loading: true, error: null }
    case 'GET_ORDERS_SUCCESS':
      return {
        ...state,
        loading: false,
        orders: action.payload.orders,
        totalPages: action.payload.totalPages,
        currentPage: action.payload.currentPage,
        total: action.payload.total,
        error: null,
      }
    case 'CREATE_ORDER_SUCCESS':
      return {
        ...state,
        loading: false,
        orders: [action.payload, ...state.orders],
        total: state.total + 1,
        error: null,
      }
    case 'UPDATE_ORDER_SUCCESS':
      return {
        ...state,
        loading: false,
        orders: state.orders.map((order) => (order._id === action.payload._id ? action.payload : order)),
        error: null,
      }
    case 'DELETE_ORDER_SUCCESS':
      return {
        ...state,
        loading: false,
        orders: state.orders.filter((order) => order._id !== action.payload),
        total: state.total - 1,
        error: null,
      }
    case 'DELETE_ORDERS_SUCCESS':
      return {
        ...state,
        loading: false,
        orders: state.orders.filter((order) => !action.payload.includes(order._id)),
        total: state.total - action.payload.length,
        error: null,
      }
    case 'GET_ORDERS_FAILURE':
    case 'CREATE_ORDER_FAILURE':
    case 'UPDATE_ORDER_FAILURE':
    case 'DELETE_ORDER_FAILURE':
    case 'DELETE_ORDERS_FAILURE':
      return { ...state, loading: false, error: action.payload }
    default:
      return state
  }
}

export default orderReducer



