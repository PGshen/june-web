import { userList, userAdd, userUpdate, userDel, userRole } from '@/api/system/user'
import { is200 } from '@/utils/http-status'

const state = {
  users: []
}

const mutations = {
  SET_USER_LIST: (state, users) => {
    state.users = users
  },
  ADD_USER: (state, user) => {
    state.users.splice(0, 0, user)
  },
  UPDATE_USER: (state, index, user) => {
    state.users.splice(index, 1, user)
  },
  DELETE_USER: (state, index) => {
    delete state.users[index]
  }
}

const actions = {
  getUserList({ commit }, listQuery) {
    return new Promise((resolve, reject) => {
      userList(listQuery).then(response => {
        const data = response.data
        if (is200(data.code)) {
          commit('SET_USER_LIST', data.data.records)
        }
        resolve(data)
      }).catch(error => {
        reject(error)
      })
    })
  },
  addUser({ commit }, user) {
    return new Promise((resolve, reject) => {
      userAdd(user).then(response => {
        const data = response.data
        if (is200(data.code)) {
          // commit('ADD_USER', role);
          resolve(data.code)
        }
      }).catch(error => {
        reject(error)
      })
    })
  },
  updateUser({ commit }, user) {
    return new Promise((resolve, reject) => {
      userUpdate(user).then(response => {
        const data = response.data
        if (is200(data.code)) {
          // commit('UPDATE_USER', index, role);
          resolve(data.code)
        }
      }).catch(error => {
        reject(error)
      })
    })
  },
  deleteUser({ commit }, id) {
    return new Promise((resolve, reject) => {
      userDel(id).then(response => {
        const data = response.data
        if (is200(data.code)) {
          // commit('DELETE_USER', index);
          resolve(data.code)
        }
      }).catch(error => {
        reject(error)
      })
    })
  },
  userRoleListForAuth({ commit }, params) {
    return new Promise((resolve, reject) => {
      userRole(params).then(response => {
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
