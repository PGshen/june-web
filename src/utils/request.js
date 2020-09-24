import axios from 'axios'
import { MessageBox, Message, Notification } from 'element-ui'
import store from '@/store'
import router from '@/router'
import { getToken } from '@/utils/auth'
import { is200, is401, is403, is404, is407, is500 } from '@/utils/http-status'

const CONTENT_TYPE = 'Content-Type'
const X_AUTH_TOKEN = 'x-auth-token'

axios.defaults.headers[CONTENT_TYPE] = 'application/json'

// create an axios instance
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API, // url = base url + request url
  withCredentials: true, // send cookies when cross-domain requests
  timeout: 30000 // request timeout
})

// request interceptor
service.interceptors.request.use(
  config => {
    // do something before request is sent

    if (store.getters.token) {
      // let each request carry token --['X-Token'] as a custom key.
      // please modify it according to the actual situation.
      // config.headers[X_AUTH_TOKEN] = getToken()
      config.headers['Authorization'] = 'Bearer ' + getToken()
    }
    return config
  },
  error => {
    // do something with request error
    console.log(error) // for debug
    return Promise.reject(error)
  }
)

// response interceptor
service.interceptors.response.use(
  /**
   * If you want to get information such as headers or status
   * Please return  response => response
   */

  /**
   * Determine the request status by custom code
   * Here is just an example
   * You can also judge the status by HTTP Status Code.
   */
  response => {
    const res = response.data
    // 若是 文件下载，不判断code，因为没有
    if (res.type === 'multipart/form-data') {
      return response
    }

    // if the custom code is not 20000, it is judged as an error.
    if (res.code !== undefined && !is200(res.code)) {
      // Message({
      //   message: res.message || 'error',
      //   type: 'error',
      //   duration: 5 * 1000
      // })
      Notification({
        title: '请求异常',
        message: res.message || '请求异常',
        type: 'warning',
        duration: 3 * 1000
      })

      // token 无效
      if (is403(res.code)) {
        // to re-login
        MessageBox.confirm('登录已过期，你可以停留在当前页面或者重新登录', '确认登出', {
          confirmButtonText: '重新登录',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          store.dispatch('user/resetToken').then(() => {
            location.reload()
          })
        })
      } else if (is401(res.code)) {
        router.push('/401')
      } else if (is404(res.code)) {
        router.push('/404')
      }
      // return Promise.reject(res.message || 'error')
      return response
    } else {
      return response
    }
  },
  error => {
    console.log('err' + error) // for debug
    Message({
      message: error.message,
      type: 'error',
      duration: 5 * 1000
    })
    return Promise.reject(error)
  }
)

export default service
