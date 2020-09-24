import Layout from '@/views/layout/Layout'

const systemRouter = {
  path: '/system',
  component: Layout,
  redirect: '/system/user',
  name: 'System',
  meta: {
    title: 'System',
    icon: 'table'
  },
  children: [
    {
      path: 'user',
      component: () => import('@/views/system/user'),
      name: 'User',
      meta: { title: 'user' }
    },
    {
      path: 'role',
      component: () => import('@/views/system/role'),
      name: 'Role',
      meta: { title: 'role' }
    },
    {
      path: 'menu',
      component: () => import('@/views/system/menu'),
      name: 'Menu',
      meta: { title: 'menu' }
    },
    {
      path: 'organization',
      component: () => import('@/views/system/organization'),
      name: 'Organization',
      meta: { title: 'organization' }
    }
  ]
}
export default systemRouter
