import { roleList, roleAdd, roleUpdate, roleDel, roleAuth, roleAuthList, roleListForUserAuth } from '@/api/system/role'
import { is200 } from '@/utils/http-status'

const state = {
  roles: []
}

const mutations = {
  SET_ROLE_LIST: (state, roles) => {
    state.roles = roles
  },
  ADD_ROLE: (state, role) => {
    state.roles.splice(0, 0, role)
  },
  UPDATE_ROLE: (state, index, role) => {
    state.roles.splice(index, 1, role)
  },
  DELETE_ROLE: (state, index) => {
    delete state.roles[index]
  }
}

const actions = {
  getRoleList({ commit }, params) {
    return new Promise((resolve, reject) => {
      roleList(params).then(response => {
        const data = response.data
        if (is200(data.code)) {
          commit('SET_ROLE_LIST', data.data.records)
        }
        resolve(data)
      }).catch(error => {
        reject(error)
      })
    })
  },
  addRole({ commit }, role) {
    return new Promise((resolve, reject) => {
      roleAdd(role).then(response => {
        const data = response.data
        if (is200(data.code)) {
          // commit('ADD_ROLE', role);
          resolve(data.code)
        }
      }).catch(error => {
        reject(error)
      })
    })
  },
  updateRole({ commit }, role) {
    return new Promise((resolve, reject) => {
      roleUpdate(role).then(response => {
        const data = response.data
        if (is200(data.code)) {
          // commit('UPDATE_ROLE', index, role);
          resolve(data.code)
        }
      }).catch(error => {
        reject(error)
      })
    })
  },
  deleteRole({ commit }, id) {
    return new Promise((resolve, reject) => {
      roleDel(id).then(response => {
        const data = response.data
        if (is200(data.code)) {
          // commit('DELETE_ROLE', index);
          resolve(data.code)
        }
      }).catch(error => {
        reject(error)
      })
    })
  },
  authRole({ commit }, auth) {
    return new Promise((resolve, reject) => {
      roleAuth(auth).then(response => {
        const data = response.data
        if (is200(data.code)) {
          resolve(data.code)
        }
      }).catch(error => {
        reject(error)
      })
    })
  },
  authListRole({ commit }, roleId) {
    return new Promise((resolve, reject) => {
      roleAuthList(roleId).then(response => {
        const data = response.data
        if (is200(data.code)) {
          resolve(data)
        }
      }).catch(error => {
        reject(error)
      })
    })
  },
  roleListForUserAuth({ commit }) {
    return new Promise((resolve, reject) => {
      roleListForUserAuth().then(response => {
        const data = response.data
        if (is200(data.code)) {
          resolve(data)
        }
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
