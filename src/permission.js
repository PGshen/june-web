import router from './router'
import store from './store'
import { Message } from 'element-ui'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css' // progress bar style
import { getToken } from '@/utils/auth' // get token from cookie
import getPageTitle from '@/utils/get-page-title'
import { is200, is401, is403, is404, is407, is500 } from '@/utils/http-status'

NProgress.configure({ showSpinner: false }) // NProgress Configuration

const whiteList = ['/login', '/auth-redirect'] // no redirect whitelist

router.beforeEach(async(to, from, next) => {
  // start progress bar
  NProgress.start()

  // set page title
  document.title = getPageTitle(to.meta.title)

  // determine whether the user has logged in
  const hasToken = getToken()

  if (hasToken) {
    if (to.path === '/login') {
      // if is logged in, redirect to the home page
      next({ path: '/' })
      NProgress.done()
    } else {
      // determine whether the user has obtained his permission roles through getInfo
      const hasRoles = store.getters.roles && store.getters.roles.length > 0
      if (hasRoles) {
        // 路由前先进行鉴权,路由至401/404不需要鉴权
        if (to.path === '/401' || to.path === '/404') {
          next()
        } else {
          if (to.meta.url !== '' && to.meta.url !== '/' && to.meta.url !== undefined) {
            store.dispatch('permission/hasPerm', to.meta).then(() => {
              next()
            }).catch(() => {
              next({ path: '/401', replace: true, query: { noGoBack: true }})
            })
          } else {
            next()
          }
        }
      } else {
        store.dispatch('user/getInfo').then(res => { // 拉取user_info
          store.dispatch('permission/routerTree').then(() => { // 根据roles权限生成可访问的路由表
            store.dispatch('permission/getPerms').then(() => { // 获取当前用户的权限列表
              router.addRoutes(store.getters.addRouters) // 动态添加可访问路由表
              next({ ...to, replace: true }) // hack方法 确保addRoutes已完成 ,set the replace: true so the navigation will not leave a history record
            })
          })
        }).catch(() => {
          console.log('login error')
          store.dispatch('user/fedLogOut').then(() => {
            Message.error('Verification failed, please login again')
            next(`/login?redirect=${to.path}`)
            NProgress.done()
          })
        })
      }
    }
  } else {
    /* has no token*/

    if (whiteList.indexOf(to.path) !== -1) {
      // in the free login whitelist, go directly
      next()
    } else {
      // other pages that do not have permission to access are redirected to the login page.
      next(`/login?redirect=${to.path}`)
      NProgress.done()
    }
  }
})

router.afterEach(() => {
  // finish progress bar
  NProgress.done()
})
