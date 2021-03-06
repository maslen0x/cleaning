import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'

import Layout from 'antd/lib/layout'
import Menu from 'antd/lib/menu'
import Row from 'antd/lib/row'
import Col from 'antd/lib/col'
import {
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  PhoneOutlined,
  CalculatorOutlined,
  PictureOutlined,
  LikeOutlined,
  SolutionOutlined,
  DollarOutlined }
from '@ant-design/icons'

import { RootState } from '../store/reducers'

const { Sider, Header, Content } = Layout

interface IMenuItem {
  label: string
  href: string
  icon: any
}

const AdminLayout: React.FC = ({ children }) => {
  const menu: IMenuItem[] = [
    { label: 'Услуги', href: '/admin/services', icon: DollarOutlined },
    { label: 'Обратные звонки', href: '/admin/back-calls', icon: PhoneOutlined },
    { label: 'Заявки (калькулятор)', href: '/admin/requests/calc', icon: CalculatorOutlined },
    { label: 'Заявки (фото)', href: '/admin/requests/photo', icon: PictureOutlined },
    { label: 'Отзывы', href: '/admin/reviews', icon: LikeOutlined },
    { label: 'Заказы', href: '/admin/orders', icon: SolutionOutlined }
  ]

  const router = useRouter()

  const currentUser = useSelector((state: RootState) => state.user.currentUser)

  const [isCollapsed, setCollapsed] = useState<boolean>(false)
  const [currentPage, setCurrentPage] = useState<string>('')

  const getKey = (str: string) => str.replace('/admin/', '')

  useEffect(() => {
    const key = getKey(router.pathname)
    setCurrentPage(key)
  }, [])

  const onToggle = () => setCollapsed(!isCollapsed)

  return currentUser && (
    <>
      <Head>
        <title>Клининговая компания — Панель администратора</title>
        <meta name="robots" content="noindex, nofollow" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Layout className="layout admin">
        <Sider trigger={null} collapsible collapsed={isCollapsed}>
          <Menu theme="dark" mode="inline" selectedKeys={[currentPage]}>
            {menu.map((item: IMenuItem) => (
              <Menu.Item key={item.href.replace('/admin/', '')} icon={item.icon.render()}>
                <Link href={item.href}>
                  <a>{item.label}</a>
                </Link>
              </Menu.Item>
            ))}
          </Menu>
        </Sider>

        <Layout>
          <Header className="admin__header">
            <Row justify="space-between" align="middle">
              <Col>
                <button onClick={onToggle} className="btn-reset">
                  {isCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                </button>
              </Col>

              <Col>
                <Link href="/">
                  <a className="admin__logo">
                    <Image
                      src="/logo.svg"
                      alt="Логотип клининговой компании"
                      width={50}
                      height={50}
                    />
                  </a>
                </Link>
              </Col>
            </Row>
          </Header>

          <Content className="admin__content">{children}</Content>
        </Layout>
      </Layout>

    </>
  )
}

export default AdminLayout
