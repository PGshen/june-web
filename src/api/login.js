/* eslint-disable semi */
import request from '@/utils/request'
import { encryption } from '@/utils/tools'

const realApiUrl = {
  login: '/login',
  logout: '/logout',
  userInfo: '/admin/users/now'
};

const url = realApiUrl;

export function loginByEmail(email, password) {
  const data = {
    email,
    password
  };
  return request({
    url: '/admin/login/loginbyemail',
    method: 'post',
    data
  });
}

export function login({ username, password }) {
  const userInfo = { username, password };
  const user = encryption({
    data: userInfo,
    key: '1234567887654321',
    param: ['password']
  });

  const params = {
    username: user.username,
    password: user.password,
    grant_type: 'password',
    scope: 'server',
    client_id: 'app',
    client_secret: 'app'
  }

  return request({
    url: url.login,
    method: 'post',
    params
  });
}

export function logout() {
  return request({
    url: url.logout,
    method: 'post'
  });
}

export function getInfo() {
  return request({
    url: url.userInfo,
    method: 'post'
  });
}
