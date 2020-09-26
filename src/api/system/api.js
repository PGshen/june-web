import request from '@/utils/request'

const realApiUrl = {
  apiTree: '/admin/apis/tree',
  apiAdd: '/admin/api',
  apiUpdate: '/admin/api',
  apiDelete: '/admin/api'
}

const url = realApiUrl

export function apiTree() {
  return request({
    url: url.apiTree,
    method: 'get'
  })
}

export function apiAdd(api) {
  return request({
    url: url.apiAdd,
    method: 'post',
    data: api
  })
}

export function apiUpdate(id, api) {
  const urlWithId = url.apiUpdate + '/' + id
  return request({
    url: urlWithId,
    method: 'put',
    data: api
  })
}

export function apiDelete(id) {
  const urlWithId = url.apiDelete + '/' + id
  return request({
    url: urlWithId,
    method: 'delete'
  })
}
