const initialState = {
  logs: [],
  stats: null,
  loading: false,
  error: null,
}

const activityLogReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'GET_ACTIVITY_LOGS_REQUEST':
    case 'GET_ACTIVITY_STATS_REQUEST':
      return {
        ...state,
        loading: true,
        error: null,
      }
    case 'GET_ACTIVITY_LOGS_SUCCESS':
      return {
        ...state,
        logs: action.payload,
        loading: false,
        error: null,
      }
    case 'GET_ACTIVITY_STATS_SUCCESS':
      return {
        ...state,
        stats: action.payload,
        loading: false,
        error: null,
      }
    case 'GET_ACTIVITY_LOGS_FAILURE':
    case 'GET_ACTIVITY_STATS_FAILURE':
      return {
        ...state,
        loading: false,
        error: action.payload,
      }
    default:
      return state
  }
}

export default activityLogReducer



