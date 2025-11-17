const initialState = {
  templates: [],
  loading: false,
  error: null,
}

const templateReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'GET_TEMPLATES_REQUEST':
    case 'CREATE_TEMPLATE_REQUEST':
    case 'UPDATE_TEMPLATE_REQUEST':
    case 'DELETE_TEMPLATE_REQUEST':
      return { ...state, loading: true, error: null }
    case 'GET_TEMPLATES_SUCCESS':
      return { ...state, loading: false, templates: action.payload, error: null }
    case 'CREATE_TEMPLATE_SUCCESS':
      return { ...state, loading: false, templates: [...state.templates, action.payload], error: null }
    case 'UPDATE_TEMPLATE_SUCCESS':
      return {
        ...state,
        loading: false,
        templates: state.templates.map((template) =>
          template._id === action.payload._id ? action.payload : template
        ),
        error: null,
      }
    case 'DELETE_TEMPLATE_SUCCESS':
      return {
        ...state,
        loading: false,
        templates: state.templates.filter((template) => template._id !== action.payload),
        error: null,
      }
    case 'GET_TEMPLATES_FAILURE':
    case 'CREATE_TEMPLATE_FAILURE':
    case 'UPDATE_TEMPLATE_FAILURE':
    case 'DELETE_TEMPLATE_FAILURE':
      return { ...state, loading: false, error: action.payload }
    default:
      return state
  }
}

export default templateReducer



