const initialState = {
  attributes: [],
  loading: false,
  error: null,
}

const productAttributeReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'GET_ATTRIBUTES_REQUEST':
    case 'CREATE_ATTRIBUTE_REQUEST':
    case 'UPDATE_ATTRIBUTE_REQUEST':
    case 'DELETE_ATTRIBUTE_REQUEST':
    case 'UPDATE_ATTRIBUTE_ORDER_REQUEST':
      return { ...state, loading: true, error: null }
    case 'GET_ATTRIBUTES_SUCCESS':
      return { ...state, loading: false, attributes: action.payload, error: null }
    case 'CREATE_ATTRIBUTE_SUCCESS':
      return { ...state, loading: false, attributes: [...state.attributes, action.payload], error: null }
    case 'UPDATE_ATTRIBUTE_SUCCESS':
      return {
        ...state,
        loading: false,
        attributes: state.attributes.map((attr) => (attr._id === action.payload._id ? action.payload : attr)),
        error: null,
      }
    case 'DELETE_ATTRIBUTE_SUCCESS':
      return {
        ...state,
        loading: false,
        attributes: state.attributes.filter((attr) => attr._id !== action.payload),
        error: null,
      }
    case 'UPDATE_ATTRIBUTE_ORDER_SUCCESS':
      return { ...state, loading: false, attributes: action.payload, error: null }
    case 'GET_ATTRIBUTES_FAILURE':
    case 'CREATE_ATTRIBUTE_FAILURE':
    case 'UPDATE_ATTRIBUTE_FAILURE':
    case 'DELETE_ATTRIBUTE_FAILURE':
    case 'UPDATE_ATTRIBUTE_ORDER_FAILURE':
      return { ...state, loading: false, error: action.payload }
    default:
      return state
  }
}

export default productAttributeReducer



