import { asyncRoutes, constantRoutes } from '@/router'
import { routerTree, hasPerm, permList } from '@/api/system/menu'
import { is200 } from '../../utils/http-status'

// const _import = require('../../router/_import_' + process.env.NODE_ENV)
const _import = file => require('@/views/' + file + '.vue').default // vue-loader at least v13.0.0+
/**
 * 通过meta.role判断是否与当前用户权限匹配
 * @param roles
 * @param route
 */
function hasPermission(roles, route) {
  if (route.meta && route.meta.roles) {
    return roles.some(role => route.meta.roles.indexOf(role) >= 0)
  } else {
    return true
  }
}

/**
 * 递归过滤异步路由表，返回符合用户角色权限的路由表
 * @param asyncRoutes
 * @param roles
 */
function filterAsyncRouter(asyncRoutes, roles) {
  const accessedRouters = asyncRoutes.filter(route => {
    if (hasPermission(roles, route)) {
      if (route.children && route.children.length) {
        route.children = filterAsyncRouter(route.children, roles)
      }
      return true
    }
    return false
  })
  return accessedRouters
}

function revise(menuList) {
  if (menuList === undefined || menuList === null || menuList === '') {
    return
  }
  let menu
  for (menu in menuList) {
    if (menuList[menu].component !== undefined && menuList[menu].component !== null && menuList[menu].component !== '') {
      menuList[menu].component = _import(menuList[menu].component)
    } else {
      menuList[menu].component = null
    }
    menuList[menu].meta = { url: menuList[menu].url, btn: menuList[menu].btn, icon: menuList[menu].icon, title: menuList[menu].title }

    if (menuList[menu].alwaysShow === '1') {
      menuList[menu].alwaysShow = true
    } else {
      menuList[menu].alwaysShow = false
    }
    // 有隐藏属性或类型为按钮、非菜单页面的设置为隐藏
    if (menuList[menu].hidden === '1' || menuList[menu].type === 2 || menuList[menu].type === 3) {
      menuList[menu].hidden = true
    } else {
      menuList[menu].hidden = false
    }
    // tagView会使用到name
    menuList[menu].name = menuList[menu].menuName
    if (menuList[menu].children !== undefined && menuList[menu].children !== null && menuList[menu].children !== '') {
      revise(menuList[menu].children)
    } else {
      menuList[menu].children = []
    }
  }
}

const state = {
  routers: constantRoutes,
  addRouters: [],
  permList: []
}
const mutations = {
  SET_ROUTERS: (state, routers) => {
    state.addRouters = routers
    state.routers = constantRoutes.concat(routers)
  },

  SET_PERMS: (state, perms) => {
    state.permList = perms
  }
}
const actions = {

  routerTree({ commit }) {
    return new Promise((resolve, reject) => {
      routerTree().then(response => {
        const data = response.data
        revise(data.data)
        const notfound = { path: '*', redirect: '/404', hidden: true }
        data.data.push(notfound)
        if (is200(data.code)) {
          commit('SET_ROUTERS', data.data)
        }
        resolve(data.code)
      }).catch(error => {
        reject(error)
      })
    })
  },

  hasPerm({ commit }, data) {
    return new Promise((resolve, reject) => {
      const { url } = data
      hasPerm(url).then(response => {
        const data = response.data
        resolve(data.code)
      }).catch(error => {
        reject(error)
      })
    })
  },

  getPerms({ commit }) {
    return new Promise((resolve, reject) => {
      permList().then(response => {
        const data = response.data
        if (is200(data.code)) {
          commit('SET_PERMS', data.data)
        }
        resolve(data.code)
      }).catch(error => {
        reject(error)
      })
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
