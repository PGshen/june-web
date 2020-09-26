import request from '@/utils/request'

const realApiUrl = {
  roleList: '/admin/roles/list',
  roleAll: '/admin/roles/all',
  roleAdd: '/admin/role',
  roleUpdate: '/admin/role',
  roleDelete: '/admin/role',
  roleAuth: '/admin/roles/auth',
  roleMenu: '/admin/roles/menu'
}

const url = realApiUrl

// 分页获取角色
export function roleList(params) {
  return request({
    url: url.roleList,
    method: 'post',
    data: params
  })
}

// 获取全部角色
export function roleAll() {
  return request({
    url: url.roleAll,
    method: 'get'
  })
}

export function roleAdd(role) {
  return request({
    url: url.roleAdd,
    method: 'post',
    data: role
  })
}

export function roleUpdate(id, role) {
  const updUrl = process.env.USE_CRAP_API ? url.roleUpdate : url.roleUpdate + '/' + id
  return request({
    url: updUrl,
    method: 'put',
    data: role
  })
}

export function roleDel(id) {
  const delUrl = process.env.USE_CRAP_API ? url.roleDelete : url.roleDelete + '/' + id
  return request({
    url: delUrl,
    method: 'delete'
  })
}

// 角色授权
export function roleAuth(auth) {
  return request({
    url: url.roleAuth,
    method: 'put',
    data: auth
  })
}

export function roleMenu(roleId) {
  const roleMenuUrl = process.env.USE_CRAP_API ? url.roleMenu : url.roleMenu + '/' + roleId
  return request({
    url: roleMenuUrl,
    method: 'get'
  })
}
