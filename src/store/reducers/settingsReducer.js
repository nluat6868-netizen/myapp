const initialState = {
  settings: null,
  loading: false,
  error: null,
}

const settingsReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'GET_SETTINGS_REQUEST':
    case 'UPDATE_SETTINGS_REQUEST':
      return { ...state, loading: true, error: null }
    case 'GET_SETTINGS_SUCCESS':
      return { ...state, loading: false, settings: action.payload, error: null }
    case 'UPDATE_SETTINGS_SUCCESS':
      return { ...state, loading: false, settings: action.payload, error: null }
    case 'GET_SETTINGS_FAILURE':
    case 'UPDATE_SETTINGS_FAILURE':
      return { ...state, loading: false, error: action.payload }
    default:
      return state
  }
}

export default settingsReducer




