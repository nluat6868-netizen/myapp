import { all } from 'redux-saga/effects'
import authSaga from './authSaga'
import userSaga from './userSaga'
import faqSaga from './faqSaga'
import productAttributeSaga from './productAttributeSaga'
import productSaga from './productSaga'
import orderSaga from './orderSaga'
import templateSaga from './templateSaga'
import toneSaga from './toneSaga'
import settingsSaga from './settingsSaga'
import ticketSaga from './ticketSaga'
import activityLogSaga from './activityLogSaga'
import socialConnectionSaga from './socialConnectionSaga'
import socialPostSaga from './socialPostSaga'
import promotionSaga from './promotionSaga'
import messageSaga from './messageSaga'

export default function* rootSaga() {
  yield all([
    authSaga(),
    userSaga(),
    faqSaga(),
    productAttributeSaga(),
    productSaga(),
    orderSaga(),
    promotionSaga(),
    templateSaga(),
    toneSaga(),
    settingsSaga(),
    ticketSaga(),
    activityLogSaga(),
    socialConnectionSaga(),
    socialPostSaga(),
    messageSaga(),
  ])
}

