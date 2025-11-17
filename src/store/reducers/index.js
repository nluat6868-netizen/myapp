import { combineReducers } from 'redux'
import authReducer from './authReducer'
import userReducer from './userReducer'
import faqReducer from './faqReducer'
import productAttributeReducer from './productAttributeReducer'
import productReducer from './productReducer'
import orderReducer from './orderReducer'
import templateReducer from './templateReducer'
import toneReducer from './toneReducer'
import settingsReducer from './settingsReducer'
import ticketReducer from './ticketReducer'
import activityLogReducer from './activityLogReducer'
import socialConnectionReducer from './socialConnectionReducer'
import promotionReducer from './promotionReducer'
import messageReducer from './messageReducer'

const rootReducer = combineReducers({
  auth: authReducer,
  users: userReducer,
  faqs: faqReducer,
  productAttributes: productAttributeReducer,
  products: productReducer,
  orders: orderReducer,
  promotions: promotionReducer,
  templates: templateReducer,
  tones: toneReducer,
  settings: settingsReducer,
  tickets: ticketReducer,
  activityLogs: activityLogReducer,
  socialConnections: socialConnectionReducer,
  messages: messageReducer,
})

export default rootReducer

