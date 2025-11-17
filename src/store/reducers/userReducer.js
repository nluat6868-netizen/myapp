const initialState = {
  users: [],
  loading: false,
  error: null,
}

const userReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'GET_USERS_REQUEST':
    case 'CREATE_USER_REQUEST':
    case 'UPDATE_USER_REQUEST':
    case 'DELETE_USER_REQUEST':
      return {
        ...state,
        loading: true,
        error: null,
      }
    case 'GET_USERS_SUCCESS':
      return {
        ...state,
        loading: false,
        users: action.payload,
        error: null,
      }
    case 'CREATE_USER_SUCCESS':
      return {
        ...state,
        loading: false,
        users: [...state.users, action.payload],
        error: null,
      }
    case 'UPDATE_USER_SUCCESS':
      return {
        ...state,
        loading: false,
        users: state.users.map((user) =>
          user._id === action.payload._id ? action.payload : user
        ),
        error: null,
      }
    case 'DELETE_USER_SUCCESS':
      return {
        ...state,
        loading: false,
        users: state.users.filter((user) => user._id !== action.payload),
        error: null,
      }
    case 'GET_USERS_FAILURE':
    case 'CREATE_USER_FAILURE':
    case 'UPDATE_USER_FAILURE':
    case 'DELETE_USER_FAILURE':
      return {
        ...state,
        loading: false,
        error: action.payload,
      }
    default:
      return state
  }
}

export default userReducer




