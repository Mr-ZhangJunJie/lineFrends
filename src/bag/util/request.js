import axios from 'axios'

// create an axios instance
const service = axios.create({
  timeout: 12000,
  headers: { 'content-type': 'application/x-www-form-urlencoded' }
})

// request interceptor
service.interceptors.request.use(
  config => {
    loading()
    // config.headers = Object.assign({}, {...config.headers}, {'Referer': encodeURIComponent(window.location.hostname), 'Orign': encodeURIComponent(window.location.hostname)})
    // console.log('interceptors request config before:', config);
    // config.headers = Object.assign({}, {...config.headers}, {'Refer': window.location.hostname, 'Orign': window.location.hostname})
    // console.log('interceptors request config after:', config.headers);
    // loading()
    return config
  },
  error => {
    // do something with request error
    return Promise.reject(error)
  }
)

// response interceptor
service.interceptors.response.use(

  response => {
    loading({state: 0})
    const res = response.data
    // if the custom code is not 20000, it is judged as an error.
    return res
  },
  error => {
    console.log('interceptors!!', error) // for debug
    return Promise.reject(error)
  }
)

export default service
