const initialState = {
  tones: [],
  loading: false,
  error: null,
}

const toneReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'GET_TONES_REQUEST':
    case 'CREATE_TONE_REQUEST':
    case 'UPDATE_TONE_REQUEST':
    case 'DELETE_TONE_REQUEST':
      return { ...state, loading: true, error: null }
    case 'GET_TONES_SUCCESS':
      return { ...state, loading: false, tones: action.payload, error: null }
    case 'CREATE_TONE_SUCCESS':
      return { ...state, loading: false, tones: [...state.tones, action.payload], error: null }
    case 'UPDATE_TONE_SUCCESS':
      return {
        ...state,
        loading: false,
        tones: state.tones.map((tone) => (tone._id === action.payload._id ? action.payload : tone)),
        error: null,
      }
    case 'DELETE_TONE_SUCCESS':
      return {
        ...state,
        loading: false,
        tones: state.tones.filter((tone) => tone._id !== action.payload),
        error: null,
      }
    case 'GET_TONES_FAILURE':
    case 'CREATE_TONE_FAILURE':
    case 'UPDATE_TONE_FAILURE':
    case 'DELETE_TONE_FAILURE':
      return { ...state, loading: false, error: action.payload }
    default:
      return state
  }
}

export default toneReducer




