import { HYDRATE } from 'next-redux-wrapper'
import { combineReducers } from 'redux'

import track from './track'

const rootReducer = combineReducers({
  track
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