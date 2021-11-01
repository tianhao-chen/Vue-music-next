/*
 * 该文件是运行在Node.js端的，获取数据的基本思路就是后端代理，即提供接口路由供前端页面使用，然后在路由内部，我们接收到前端请求后，再发送HTTP请求到第三方服务接口，携带相应的请求参数，包括签名的参数字段等等。
 * 对于从第三方接口返回的数据，我们会做一层数据处理，最终提供给前端的数据前端可以直接使用，无需再处理。这样也比较符合真实企业项目的开发规范，即数据的处理放在后端做，前端只做数据渲染和交互
*/
const axios = require("axios")
const pinyin = require('pinyin')
const Base64 = require('js-base64').Base64

// 获取签名方法
const getSecuritySign = require('./sign')

const ERR_OK = 0
const token = 5381
// 歌曲图片加载失败时使用的默认图片
const fallbackPicUrl = 'https://y.gtimg.cn/mediastyle/music_v11/extra/default_300x300.jpg?max_age=31536000'
// 公共参数
const commonParams = {
    g_tk: token,
    loginUin: 0,
    hostUin: 0,
    inCharset: "utf8",
    outCharset: "utf-8",
    notice: 0,
    needNewCode: 0, 
    format:'json',
    platform:'yqq.json'
}

// 获取一个随机数值
function getRandomVal(prefix = '') {
    return prefix+(Math.random()+'').replace('0.','')
}

// 获取一个随机 uid
function getUid() {
  const t = (new Date()).getUTCMilliseconds()
  return '' + Math.round(2147483647 * Math.random()) * t % 1e10
}

// 对axios get请求的封装
// 修改请求的headers值，合并公共请求参数
function get(url, params) {
    return axios.get(url, {
        headers: {
            referer: 'https://y.qq.com/',
            origin: 'https://y.qq.com/'
        },
        params: Object.assign({}, commonParams, params)
    })
}
// 对 axios post 请求的封装
// 修改请求的 headers 值
function post(url, params) {
  return axios.post(url, params, {
    headers: {
      referer: 'https://y.qq.com/',
      origin: 'https://y.qq.com/',
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })
}

// 歌曲列表处理函数handleSongList
function handleSongList(list) {
  const songList = []
  //遍历list
  list.forEach((item) => {
    // 可能的不同数据形式
    const info = item.songInfo || item
    if (info.pay.pay_play !== 0 || !info.interval) {
      // 过滤付费歌曲和获取不到时长的歌曲
      return
    }
    // 构造歌曲的数据结构
    const song = {
      id: info.id,
      mid: info.mid,
      name: info.name,
      singer: mergeSinger(info.singer),
      // 在另一个接口获取，这个接口拿不到
      url: '',
      duration: info.interval,
      pic: info.album.mid ? `https://y.gtimg.cn/music/photo_new/T002R800x800M000${info.album.mid}.jpg?max_age=2592000` : fallbackPicUrl,
      album: info.album.name
    }

    songList.push(song)
  })


  return songList
}

// 合并多个歌手的姓名
function mergeSinger(singer) {
  const ret = []
  if (!singer) {
    return ''
  }
  singer.forEach((s) => {
    ret.push(s.name)
  })
  return ret.join('/')
}

// 注册后端路由
function registerRouter(app) {
    registerRecommend(app)

    registerSingerList(app)
    
    registerSingerDetail(app)
    
    registerSongsUrl(app)

    registerLyric(app)
    
    registerAlbum(app)

    registerTopList(app)
    
    registerTopDetail(app)
}

// 注册推荐列表接口路由 包括轮播图的一个接口和后面歌单的接口
function registerRecommend(app) {
    app.get('/api/getRecommend', (req, res) => {
        // 第三方服务接口 url
        const url = 'https://u.y.qq.com/cgi-bin/musics.fcg'

        // 构造请求data参数
        const data = JSON.stringify({
            comm: { ct: 24},
            recomPlaylist: {
                method: 'get_hot_recommend',
                param: { async: 1, cmd: 2 },
                module: 'playlist.HotRecommendServer'
            },
            focus: { module:'music.musicHall.MusicHallPlatform', method:'GetFocus',param:{} }
        })

        // 随机数值
        const randomVal = getRandomVal('recom')
        // 计算签名值
        const sign = getSecuritySign(data)

        // 发送get请求
        get(url, {
            sign,
            "-": randomVal,
            data
        }).then((response) => {
            const data = response.data
            if (data.code === ERR_OK){
                // 处理轮播图数据
                const focusList = data.focus.data.shelf.v_niche[0].v_card
                const sliders = []
                const jumpPrefixMap = {
                    10002: 'http://y.qq.com/n/yqq/album/',
                    10014:'http://y.qq.com/n/yqq/playlist/',
                    10012:'http://y.qq.com/n/yqq/mv/v/'
                }
                // 最多获取10条数据
                const len = Math.min(focusList.length,10)
                for (let i = 0; i<len; i++) {
                    const item = focusList[i]
                    const sliderItem = {}
                    // 单个轮播图数据包括 id、pick、link等字段
                    sliderItem.id = item.id
                    sliderItem.pic = item.cover
                    if (jumpPrefixMap[item.jumptype]) {
                        sliderItem.link = jumpPrefixMap[item.jumptype] + (item.subid || item.id) + '.html'
                    }else if (item.jumptype === 3001) {
                        sliderItem.link = item.id
                    }

                    sliders.push(sliderItem)
                }

                // 处理推荐歌单数据
                const albumList = data.recomPlaylist.data.v_hot
                const albums = []
                for (let i = 0; i<albumList.length;i++) {
                    const item = albumList[i]
                    const albumItem = {}
                    // 推荐歌单数据包括 id、username、title、pic等字段
                    albumItem.id = item.content_id
                    albumItem.username = item.username
                    albumItem.title = item.title
                    albumItem.pic = item.cover

                    albums.push(albumItem)
                }

                //往前端发送一个标准格式的响应数据，包括成功错误码和数据
                res.json({
                    code: ERR_OK,
                    result: {
                        sliders,
                        albums
                    }
                })
            } else {
                res.json(data)
            }
        })
    })
  }

// 注册歌手列表接口路由
function registerSingerList(app) {
    // 当前端发送'/api/getSingerList'的get请求后，就会进入到该路由内部
    app.get('/api/getSingerList', (req, res) => {
    // 路由内部则是向第三方服务发送请求，拿到数据，处理后返回给前端
      // 第三方服务的url  
      const url = 'https://u.y.qq.com/cgi-bin/musics.fcg'
      const HOT_NAME = '热'
      // 构造相关数据结构
      const data = JSON.stringify({
        comm: { ct: 24, cv: 0 },
        singerList: {
          module: 'Music.SingerListServer',
          method: 'get_singer_list',
          param: { area: -100, sex: -100, genre: -100, index: -100, sin: 0, cur_page: 1 }
        }
      })
  
      const randomKey = getRandomVal('getUCGI')
      const sign = getSecuritySign(data)
      
      //发送get请求到第三方服务
      get(url, {
        sign,
        '-': randomKey,
        data
      }).then((response) => {
        //第三方服务接受到请求之后返回一个响应
        const data = response.data
        // ERR_OK = 0 =>成功
        if (data.code === ERR_OK) {
          // 处理歌手列表数据
          const singerList = data.singerList.data.singerlist
          
          // 构造歌手 Map 数据结构
          const singerMap = {
            hot: {
              title: HOT_NAME,
              // 此处的map不是js的数组map方法，而是应该函数名。
              // 该处的数据结构显然是不满足我们需求的，利用map返回所需数据结构。
              list: map(singerList.slice(0, 10))
            }
          }
          // 遍历singerList
          singerList.forEach((item) => {
            // 把歌手名转成拼音
            // pinyin库安装在devDependeices下
            const p = pinyin(item.singer_name)
            if (!p || !p.length) {
              return
            }
            // 获取歌手名拼音的首字母
            const key = p[0][0].slice(0, 1).toUpperCase()
            if (key) {
              if (!singerMap[key]) {
                singerMap[key] = {
                  title: key,
                  list: []
                }
              }
              // 每个字母下面会有多名歌手
              singerMap[key].list.push(map([item])[0])
            }
          })
          // singerMap是无序的对象，
          // 展示需要有序按热+字母排序
          // 热门歌手
          const hot = []
          // 字母歌手
          const letter = []
  
          // 遍历处理 singerMap，让结果有序
          for (const key in singerMap) {
            const item = singerMap[key]
            if (item.title.match(/[a-zA-Z]/)) {
              letter.push(item)
            } else if (item.title === HOT_NAME) {
              hot.push(item)
            }
          }
          // 按字母顺序排序
          letter.sort((a, b) => {
            return a.title.charCodeAt(0) - b.title.charCodeAt(0)
          })
          // 返回排序后的singer数据到“singers”中
          res.json({
            code: ERR_OK,
            result: {
              singers: hot.concat(letter)
            }
          })
        } else {
          res.json(data)
        }
      })
    })
  
    // 做一层数据映射，构造单个 singer 数据结构
    function map(singerList) {
      return singerList.map((item) => {
        return {
          id: item.singer_id,
          mid: item.singer_mid,
          name: item.singer_name,
          pic: item.singer_pic.replace(/\.webp$/, '.jpg').replace('150x150', '800x800')
        }
      })
    }
  }

// 注册歌手详情列表接口路由
function registerSingerDetail(app) {
    // 当前端发送'/api/getSingerList'的get请求后，就会进入到该路由内部
    app.get('/api/getSingerDetail', (req, res) => {
      // 路由内部则是向第三方服务发送请求，拿到数据，处理后返回给前端
        // 第三方服务的url  
        const url = 'https://u.y.qq.com/cgi-bin/musics.fcg'
        
        // 构造相关数据结构
        const data = JSON.stringify({
          comm: { ct: 24, cv: 0 },
          singerSongList: { 
            method: 'GetSingerSongList',
            // req.query.mid为歌手的唯一id用来避免重名，因此需要在此处申明singerMid来请求
            param: { order: 1, singerMid: req.query.mid, begin: 0, num: 100},
            module: 'musichall.song_list_server'
          }
        })
        
        const randomKey = getRandomVal('getSingerSong')
        const sign = getSecuritySign(data)
        
        //发送get请求到第三方服务
        get(url, {
          sign,
          '-': randomKey,
          data
        }).then((response) => {
          //第三方服务接受到请求之后返回一个响应
          const data = response.data
          // ERR_OK = 0 =>成功
          if (data.code === ERR_OK) {
            const list = data.singerSongList.data.songList
            // 处理数据，后续的歌单详情和榜单详情接口都有类似的逻辑，故封装成函数
            const songList = handleSongList(list)

            res.json({
              code: ERR_OK,
              result: {
                songs: songList
              }
            })
          } else {
            res.json(data)
          }
        })
      })
  }
// 注册歌曲url获取接口路由
// 因为歌曲的url每天都在变化，所以需要单独的接口根据歌曲的mid获取  
function registerSongsUrl(app) {
  app.get('/api/getSongUrl', (req, res) => {
    const mid = req.query.mid

    let midGroup = []
    // 第三方接口支持最多处理100条数据，所以如果超过100条数据，我们要把数据按每组100条切割，发送多个请求
    if (mid.length > 100) {
      const groupLen = Math.ceil(mid.length / 100)
      for (let i = 0; i < groupLen; i++) {
        midGroup.push(mid.slice(i * 100, (100 * (i + 1))))
      }
    } else {
      midGroup = [mid]
    }


    // 以歌曲的mid为key，存储歌曲URL
    const urlMap = {}
    // 处理返回的mid 
    function process(mid) {
      const data = {
        req_0: {
          module: 'vkey.GetVkeyServer',
          method: 'CgiGetVkey',
          param: {
            guid: getUid(),
            songmid: mid,
            songtype: new Array(mid.length).fill(0),
            uin: '0',
            loginflag: 0,
            platform: '23',
            h5to: 'speed'
          }
        },
        comm: {
          g_tk: token,
          uin: '0',
          format: 'json',
          platform: 'h5'
        }
      }
      const sign = getSecuritySign(JSON.stringify(data))
      const url = `https://u.y.qq.com/cgi-bin/musics.fcg?_=${getRandomVal()}&sign=${sign}`

      // 发送post请求
      return post(url, data).then((response) => {
        const data = response.data
        if (data.code === ERR_OK) {
          const midInfo = data.req_0.data.midurlinfo
          const sip = data.req_0.data.sip
          const domain = sip[sip.length - 1]
          midInfo.forEach((info) => {
            // 获取歌曲的真实播放URL
            urlMap[info.songmid] = domain + info.purl
          })
        }
      })
    }

    //构造多个Promise请求
    const requests = midGroup.map((mid) => {
      return process(mid)
    })

    // 并行发送多个请求
    return Promise.all(requests).then(() => {
      // 所有请求响应完毕, urlMap也就构造完成
      res.json({
        code: ERR_OK,
        result: {
          map: urlMap
        }
      })
    })
  })
}

// 获取歌词
function registerLyric(app) {
  app.get('/api/getLyric', (req, res) => {
    const url = 'https://c.y.qq.com/lyric/fcgi-bin/fcg_query_lyric_new.fcg'

    get(url, {
      '-': 'MusicJsonCallback_lrc',
      pcachetime: +new Date(),
      songmid: req.query.mid,
      g_tk_new_20200303: token
    }).then((response) => {
      const data = response.data
      if (data.code === ERR_OK) {
        res.json({
          code: ERR_OK,
          result: {
            lyric: Base64.decode(data.lyric)
          }
        })
      } else {
        res.json(data)
      }
    })
  })
}

function registerAlbum(app) {
  app.get('/api/getAlbum', (req, res) => {
    const data = {
      req_0: {
        module: 'srf_diss_info.DissInfoServer',
        method: 'CgiGetDiss',
        param: {
          disstid: Number(req.query.id),
          onlysonglist: 1,
          song_begin: 0,
          song_num: 100
        }
      },
      comm: {
        g_tk: token,
        uin: '0',
        format: 'json',
        platform: 'h5'
      }
    }

    const sign = getSecuritySign(JSON.stringify(data))

    const url = `https://u.y.qq.com/cgi-bin/musics.fcg?_=${getRandomVal()}&sign=${sign}`

    post(url, data).then((response) => {
      const data = response.data
      if (data.code === ERR_OK) {
        const list = data.req_0.data.songlist
        const songList = handleSongList(list)

        res.json({
          code: ERR_OK,
          result: {
            songs: songList
          }
        })
      } else {
        res.json(data)
      }
    })
  })
}

// 注册排行榜接口
function registerTopList(app) {
  app.get('/api/getTopList', (req, res) => {
    const url = 'https://u.y.qq.com/cgi-bin/musics.fcg'

    const data = JSON.stringify({
      comm: { ct: 24 },
      toplist: { module: 'musicToplist.ToplistInfoServer', method: 'GetAll', param: {} }
    })

    const randomKey = getRandomVal('recom')
    const sign = getSecuritySign(data)

    get(url, {
      sign,
      '-': randomKey,
      data
    }).then((response) => {
      const data = response.data
      if (data.code === ERR_OK) {
        const topList = []
        const group = data.toplist.data.group

        group.forEach((item) => {
          item.toplist.forEach((listItem) => {
            topList.push({
              id: listItem.topId,
              pic: listItem.frontPicUrl,
              name: listItem.title,
              period: listItem.period,
              songList: listItem.song.map((songItem) => {
                return {
                  id: songItem.songId,
                  singerName: songItem.singerName,
                  songName: songItem.title
                }
              })
            })
          })
        })

        res.json({
          code: ERR_OK,
          result: {
            topList
          }
        })
      } else {
        res.json(data)
      }
    })
  })
}

function registerTopDetail(app) {
  app.get('/api/getTopDetail', (req, res) => {
    const url = 'https://u.y.qq.com/cgi-bin/musics.fcg'
    const { id, period } = req.query

    const data = JSON.stringify({
      detail: {
        module: 'musicToplist.ToplistInfoServer',
        method: 'GetDetail',
        param: {
          topId: Number(id),
          offset: 0,
          num: 100,
          period
        }
      },
      comm: {
        ct: 24,
        cv:0
      }
    })

    const randomKey = getRandomVal('getUCGI')
    const sign = getSecuritySign(data)

    get(url, {
      sign,
      '-': randomKey,
      data
    }).then((response) => {
      const data = response.data
      if (data.code === ERR_OK) {
        const list = data.detail.data.songInfoList
        const songList = handleSongList(list)

        res.json({
          code: ERR_OK,
          result: {
            songs: songList
          }
        })
      } else {
        res.json(data)
      }
    })
  })
}

module.exports = registerRouter
