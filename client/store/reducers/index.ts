import { HYDRATE } from 'next-redux-wrapper'
import { combineReducers } from 'redux'

import user from './user'
import backCalls from './backCalls'
import reviews from './reviews'
import services from './services'
import orders from './orders'
import calcRequests from './calcRequests'
import photoRequests from './photoRequests'

const rootReducer = combineReducers({
  user,
  backCalls,
  reviews,
  services,
  orders,
  calcRequests,
  photoRequests
})

export const reducer = (state, action) => {
  if (action.type === HYDRATE) {
    const nextState = {
      ...state,
      ...action.payload
    }
    if (state.count) nextState.count = state.count
    return nextState
  } else {
    return rootReducer(state, action)
  }
}

export type RootState = ReturnType<typeof rootReducer>

export default rootReducer