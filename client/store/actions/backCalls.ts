import { Dispatch } from 'react'
import axios from 'axios'
import message from 'antd/lib/message'

import { IBackCall, BackCallsAction, BackCallsActionTypes, IProcessBackCallPayload } from '../../types/backCalls'

export const setBackCalls = (payload: IBackCall[]): BackCallsAction => ({
  type: BackCallsActionTypes.SET_BACK_CALLS,
  payload
})

const setLoading = (payload: boolean): BackCallsAction => ({
  type: BackCallsActionTypes.SET_BACK_CALLS_LOADING,
  payload
})

const removeBackCall = (payload: string): BackCallsAction => ({
  type: BackCallsActionTypes.REMOVE_BACK_CALL,
  payload
})

const processBackCall = (payload: IProcessBackCallPayload): BackCallsAction => ({
  type: BackCallsActionTypes.PROCESS_BACK_CALL,
  payload
})

export const fetchBackCalls = () => (dispatch: Dispatch<BackCallsAction>) => {
  dispatch(setLoading(true))
  axios.get('/api/back-calls')
    .then(({ data }) => dispatch(setBackCalls(data)))
    .catch(e => message.error(e.response.data.message))
    .finally(() => dispatch(setLoading(false)))
}

export const sendBackCall = (name: string, phone: string) => {
  axios.post('/api/back-calls', { name, phone })
    .then(() => message.success('Заявка успешно отправлена'))
    .catch(e => message.error(e.response.data.message))
}

export const fetchRemoveBackCall = (id: string) => (dispatch: Dispatch<BackCallsAction>) => {
  axios.delete(`/api/back-calls/${id}`)
    .then(({ data }) => {
      dispatch(removeBackCall(id))
      message.success(data.message)
    })
    .catch(e => message.error(e.response.data.message))
}

export const fetchProcessBackCall = (id: string) => (dispatch: Dispatch<BackCallsAction>) => {
  axios.put(`/api/back-calls/process/${id}`)
    .then(({ data }) => dispatch(processBackCall({ id, isProcessed: data.isProcessed })))
    .catch(e => message.error(e.response.data.message))
}