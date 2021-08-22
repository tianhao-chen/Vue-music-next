import axios from 'axios'

const baseURL = '/'
const ERR_OK = 0
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
