const initialState = {
  promotions: [],
  loading: false,
  error: null,
}

const promotionReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'GET_PROMOTIONS_REQUEST':
    case 'CREATE_PROMOTION_REQUEST':
    case 'UPDATE_PROMOTION_REQUEST':
    case 'DELETE_PROMOTION_REQUEST':
      return {
        ...state,
        loading: true,
        error: null,
      }
    case 'GET_PROMOTIONS_SUCCESS':
      return {
        ...state,
        promotions: action.payload,
        loading: false,
        error: null,
      }
    case 'CREATE_PROMOTION_SUCCESS':
      return {
        ...state,
        promotions: [action.payload, ...state.promotions],
        loading: false,
        error: null,
      }
    case 'UPDATE_PROMOTION_SUCCESS':
      return {
        ...state,
        promotions: state.promotions.map((promo) =>
          promo._id === action.payload._id ? action.payload : promo
        ),
        loading: false,
        error: null,
      }
    case 'DELETE_PROMOTION_SUCCESS':
      return {
        ...state,
        promotions: state.promotions.filter((promo) => promo._id !== action.payload),
        loading: false,
        error: null,
      }
    case 'GET_PROMOTIONS_FAILURE':
    case 'CREATE_PROMOTION_FAILURE':
    case 'UPDATE_PROMOTION_FAILURE':
    case 'DELETE_PROMOTION_FAILURE':
      return {
        ...state,
        loading: false,
        error: action.payload,
      }
    default:
      return state
  }
}

export default promotionReducer



