import request from '@/utils/request'

const realClientUrl = {
  clientList: '/admin/clients/list',
  clientAdd: '/admin/client',
  clientUpdate: '/admin/client',
  clientDelete: '/admin/client',
  clientIpGet: '/admin/clients/ip',
  clientIpAdd: '/admin/clients/ip',
  clientIpDelete: '/admin/clients/ip',
  clientApiGet: '/admin/clients/ips/apis/list',
  clientApiAuth: '/admin/clients/ips/api'
}

const url = realClientUrl

export function clientList(params) {
  return request({
    url: url.clientList,
    method: 'post',
    data: params
  })
}

export function clientAdd(client) {
  return request({
    url: url.clientAdd,
    method: 'post',
    data: client
  })
}

export function clientUpdate(id, client) {
  const urlWithId = url.clientUpdate + '/' + id
  return request({
    url: urlWithId,
    method: 'put',
    data: client
  })
}

export function clientDelete(id) {
  const urlWithId = url.clientDelete + '/' + id
  return request({
    url: urlWithId,
    method: 'delete'
  })
}

export function clientIpGet(clientAppId) {
  const urlWithID = url.clientIpGet + '/' + clientAppId
  return request({
    url: urlWithID,
    method: 'get'
  })
}

export function clientIpDel(clientAppId, clientAuth) {
  const urlWithID = url.clientIpDelete + '/' + clientAppId
  return request({
    url: urlWithID,
    method: 'post',
    data: clientAuth
  })
}

export function clientIpAdd(auth) {
  const urlWithID = url.clientIpAdd
  return request({
    url: urlWithID,
    method: 'post',
    data: auth
  })
}

export function clientAuth(auth) {
  return request({
    url: url.clientApiAuth,
    method: 'put',
    data: auth
  })
}

export function clientApiGet(clientAppId, clientAuth) {
  const urlWithID = url.clientApiGet
  return request({
    url: urlWithID,
    method: 'post',
    data: clientAuth
  })
}
