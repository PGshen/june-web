import { menuTree, menuAdd, menuUpdate, menuDelete } from '@/api/system/menu'
import { generateTitle } from '@/utils/i18n'
import { is200 } from '@/utils/http-status'

function revise(menuList) {
  if (menuList === undefined || menuList === null || menuList === '') {
    return
  }
  let menu
  for (menu in menuList) {
    // 无法获取this
    menuList[menu].title = generateTitle(menuList[menu].title)
    if (menuList[menu].children !== undefined && menuList[menu].children !== null) {
      revise(menuList[menu].children)
    }
  }
}

const state = {
  menuTree: null,
  menuList: null
}

const mutations = {
  SET_MENU_LIST: (state, menuList) => {
    state.menuList = menuList
    if (menuList.children !== undefined || menuList.children !== null) {
      state.menuTree = menuList.children
    }
  }
}

const actions = {
  getMenuList({ commit }) {
    return new Promise((resolve, reject) => {
      menuTree().then(response => {
        const data = response.data
        if (is200(data.code)) {
          // revise(data.data.children);
          commit('SET_MENU_LIST', data.data)
        }
        resolve(data.code)
      }).catch(error => {
        reject(error)
      })
    })
  },
  addMenu({ commit }, menu) {
    return new Promise((resolve, reject) => {
      menuAdd(menu).then(response => {
        resolve(response.data.code)
      }).catch(error => {
        reject(error)
      })
    })
  },
  updateMenu({ commit }, menu) {
    return new Promise((resolve, reject) => {
      menuUpdate(menu).then(response => {
        resolve(response.data.code)
      }).catch(error => {
        reject(error)
      })
    })
  },
  deleteMenu({ commit }, id) {
    return new Promise((resolve, reject) => {
      menuDelete(id).then(response => {
        resolve(response.data.code)
      }).catch(error => {
        reject(error)
      })
    })
  }
}
const methods = {
  generateTitle
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  methods
}
