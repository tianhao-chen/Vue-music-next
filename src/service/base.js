import axios from 'axios'

const ERR_OK = 0
const baseURL = process.env.NODE_ENV === 'production' ? 'http://139.224.53.76:3000/music' : '/'
axios.defaults.baseURL = baseURL

export function get(url, params) {
    return axios.get(url, {
        params
    }).then((res) => {
        // 返回的数据
        const serverData = res.data
        // 判断响应数据的code
        if (serverData.code === ERR_OK) {
            return serverData.result
        }
    }).catch((e) => {
        console.log(e)
    })
}
