const initialState = {
  faqs: [],
  loading: false,
  error: null,
}

const faqReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'GET_FAQS_REQUEST':
    case 'CREATE_FAQ_REQUEST':
    case 'UPDATE_FAQ_REQUEST':
    case 'DELETE_FAQ_REQUEST':
      return { ...state, loading: true, error: null }
    case 'GET_FAQS_SUCCESS':
      return { ...state, loading: false, faqs: action.payload, error: null }
    case 'CREATE_FAQ_SUCCESS':
      return { ...state, loading: false, faqs: [...state.faqs, action.payload], error: null }
    case 'UPDATE_FAQ_SUCCESS':
      return {
        ...state,
        loading: false,
        faqs: state.faqs.map((faq) => (faq._id === action.payload._id ? action.payload : faq)),
        error: null,
      }
    case 'DELETE_FAQ_SUCCESS':
      return {
        ...state,
        loading: false,
        faqs: state.faqs.filter((faq) => faq._id !== action.payload),
        error: null,
      }
    case 'GET_FAQS_FAILURE':
    case 'CREATE_FAQ_FAILURE':
    case 'UPDATE_FAQ_FAILURE':
    case 'DELETE_FAQ_FAILURE':
      return { ...state, loading: false, error: action.payload }
    default:
      return state
  }
}

export default faqReducer




