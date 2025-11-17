const initialState = {
  products: [],
  totalPages: 1,
  currentPage: 1,
  total: 0,
  loading: false,
  error: null,
}

const productReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'GET_PRODUCTS_REQUEST':
    case 'CREATE_PRODUCT_REQUEST':
    case 'UPDATE_PRODUCT_REQUEST':
    case 'DELETE_PRODUCT_REQUEST':
      return { ...state, loading: true, error: null }
    case 'GET_PRODUCTS_SUCCESS':
      return {
        ...state,
        loading: false,
        products: action.payload.products,
        totalPages: action.payload.totalPages,
        currentPage: action.payload.currentPage,
        total: action.payload.total,
        error: null,
      }
    case 'CREATE_PRODUCT_SUCCESS':
      return {
        ...state,
        loading: false,
        products: [action.payload, ...state.products],
        total: state.total + 1,
        error: null,
      }
    case 'UPDATE_PRODUCT_SUCCESS':
      return {
        ...state,
        loading: false,
        products: state.products.map((product) =>
          product._id === action.payload._id ? action.payload : product
        ),
        error: null,
      }
    case 'DELETE_PRODUCT_SUCCESS':
      return {
        ...state,
        loading: false,
        products: state.products.filter((product) => product._id !== action.payload),
        total: state.total - 1,
        error: null,
      }
    case 'GET_PRODUCTS_FAILURE':
    case 'CREATE_PRODUCT_FAILURE':
    case 'UPDATE_PRODUCT_FAILURE':
    case 'DELETE_PRODUCT_FAILURE':
      return { ...state, loading: false, error: action.payload }
    default:
      return state
  }
}

export default productReducer



