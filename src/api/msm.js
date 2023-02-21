import request from '@/request'

export function sendCodeApi(mobile) {
  return request({
    url: `/msm/send/${mobile}`,
    method: 'get'
  })
}