import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import AdminLayout from '../../../layouts/AdminLayout'

import Actions from '../../../components/Actions'
import OrderDrawer from '../../../components/OrderDrawer'

import Table from 'antd/lib/table'
import Checkbox from 'antd/lib/checkbox'
import Form from 'antd/lib/form'
import Modal from 'antd/lib/modal'
import Column from 'antd/lib/table/Column'

import getDateTime from '../../../utils/getDateTime'
import getPostData from '../../../utils/getPostData'
import getAdditionalFields from '../../../utils/getAdditionalFields'
import getTotalPrice from '../../../utils/getTotalPrice'

import { fetchCalcRequests, fetchProcessCalcRequest, fetchRemoveCalcRequest, setCalcRequests } from '../../../store/actions/calcRequests'
import { fetchCreateOrder } from '../../../store/actions/orders'

import { RootState } from '../../../store/reducers'
import { ICalcRequest } from '../../../types/calcRequests'
import { IService, IMainServiceRecord, IFormValues } from '../../../types'

const Calc: React.FC = () => {
  const dispatch = useDispatch()

  const { calcRequests, isLoading: isCalcRequestsLoading } = useSelector((state: RootState) => state.calcRequests)
  const { main, additional, isLoading: isServicesLoading } = useSelector((state: RootState) => state.services)

    const [isModalVisible, setModalVisible] = useState<boolean>(false)
  const [isDrawerVisible, setDrawerVisible] = useState<boolean>(false)
  const [request, setRequest] = useState<ICalcRequest | null>(null)
  const [id, setId] = useState<string>('')

  const [form] = Form.useForm()

  useEffect(() => {
    dispatch(fetchCalcRequests())
    return () => {
      dispatch(setCalcRequests([]))
    }
  }, [])

  const onDrawerOpen = (record: ICalcRequest) => {
    const { _id, name, email, services } = record
    const { value } = services.main

    const mainService = main.find(el => el.name === services.main.name)
    const additionals = getAdditionalFields(additional, record)

    setId(_id)
    form.setFieldsValue({ name, email, main: mainService?._id || '', value, additionals })
    setDrawerVisible(true)
  }

  const onDrawerClose = () => setDrawerVisible(false)

  const onRemove = (id: string) => dispatch(fetchRemoveCalcRequest(id))
  const onProcess = (id: string) => dispatch(fetchProcessCalcRequest(id))

  const onSuccess = () => {
    dispatch(fetchProcessCalcRequest(id))
    form.resetFields()
    onDrawerClose()
  }

  const onFormFinish = (values: IFormValues) => {
    const data = getPostData(values, main, additional)
    dispatch(fetchCreateOrder(data, onSuccess))
  }

  const onOpenModal = (record: ICalcRequest) => {
    setRequest(record)
    setModalVisible(true)
  }

  const onCloseModal = () => setModalVisible(false)

  return (
    <AdminLayout>
      <Table
        dataSource={calcRequests}
        rowKey={(record: ICalcRequest) => record._id}
        loading={isCalcRequestsLoading}
      >
        <Column title="??????" dataIndex="name" key="name" />
        <Column title="Email" dataIndex="email" key="email" />
        <Column title="????????" dataIndex="date" key="date" render={(value: string) => getDateTime(new Date(value))} />
        <Column
          title="????????????????"
          key="action"
          render={(_, record: ICalcRequest) => (
            <Actions
              record={record}
              whatToRemove="????????????"
              editText="??????????"
              onDrawerOpen={onDrawerOpen}
              onRemove={onRemove}
              onOpenModal={onOpenModal}
              config={{ edit: true, remove: true, more: true }}
            />
          )}
        />
        <Column
          title="??????????????????"
          dataIndex="isProcessed"
          key="isProcessed"
          render={(value: boolean, record: ICalcRequest) => (
            <Checkbox onChange={() => onProcess(record._id)} checked={value} />
          )}
        />
      </Table>

      <OrderDrawer
        title="???????????????? ????????????"
        submitText="??????????????"
        onClose={onDrawerClose}
        visible={isDrawerVisible}
        form={form}
        onFinish={onFormFinish}
        isLoading={isServicesLoading}
        main={main}
        additional={additional}
        config={{ email: true }}
      />

      {request && (
        <Modal
          title="???????????????????? ?? ????????????"
          visible={isModalVisible}
          footer={null}
          width={800}
          centered
          onCancel={onCloseModal}
          style={{ paddingTop: 24 }}
        >
          <p>????????????????: {request.name}</p>
          <p>Email: {request.email}</p>
          <p>???????? ???????????? ????????????: {getDateTime(new Date(request.date))}</p>

          <Table
            dataSource={[request.services.main]}
            title={() => '???????????????? ????????????'}
            rowKey={(record: IService) => record.name}
            pagination={false}
            style={{ marginBottom: 15 }}
          >
            <Column title="???????????????? ????????????" dataIndex="name" key="name" />
            <Column title="???????? ???? ????." dataIndex="price" key="price" render={(value: string) => `${value} ??????.`} />
            <Column title="????. ??????." dataIndex="units" key="units" />
            <Column title="????????????????" dataIndex="value" key="value" render={(value: string, record: IMainServiceRecord) => `${value} ${record.units === '??2' ? '??' : ''}`}  />
            <Column title="??????????????????" dataIndex="result" key="result" render={(_, record: IMainServiceRecord) => `${Number(record.price) * record.value} ??????.`} />
          </Table>

          {request.services.additionals.length ? (
            <Table
              dataSource={request.services.additionals}
              title={() => '???????????????????????????? ????????????'}
              rowKey={(record: IService) => record.name}
              pagination={false}
              style={{ marginBottom: 30 }}
            >
              <Column title="???????????????? ????????????" dataIndex="name" key="name" />
              <Column title="???????? ???? ????." dataIndex="price" key="price" render={(value: string) => `${value} ??????.`} />
              <Column title="????. ??????." dataIndex="units" key="units" />
              <Column title="????????????????" dataIndex="value" key="value" render={(value: string, record: IMainServiceRecord) => `${value} ${record.units === '??2' ? '??' : ''}`}  />
              <Column title="??????????????????" dataIndex="result" key="result" render={(_, record: IMainServiceRecord) => `${Number(record.price) * record.value} ??????.`} />
            </Table>
          ) : <></>}

          <p style={{ margin: 0 }}>?????????? ??????????????????: {getTotalPrice(request)} ??????.</p>
        </Modal>
      )}
    </AdminLayout>
  )
}

export default Calc
