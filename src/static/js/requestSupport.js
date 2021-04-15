import axios from 'axios'
import config from '@/config/index'

let instance1 = axios.create({
    // timeout: 100
  timeout: 15000
})
let apiPre = config.apiPre;
// let apiPre = 'https://api-zepeto.kajicam.com/zepeto/activity/lottery/api'
console.log('apiPre:', apiPre)

export function getFoodComicFace(base64){
  // console.log(base64)
  let formdata = new FormData()
  formdata.append('file', decodeURI(base64))
  // formdata.append('file', base64ToBlob(base64))

  return instance1({
    method: 'post',
    url: `https://manhua.kajicam.com/upload`,
    header: {
      "Content-type": 'application/x-www-form-urlencoded;charset=utf-8'
    },
    data: formdata,
    contentType: false,//告诉jQuery不要去设置Content-Type请求头
    processData: false,// 告诉jQuery不要去处理发送的数据
  })
}

export function getSceneComicFace(base64){
    // console.log(base64)
    let formdata = new FormData()
    formdata.append('file', decodeURI(base64));


    return instance1({
        method: 'post',
        url: config.sceneApi,
        // url: `https://manhua-global.kajicam.com/upload`,
        header: {
            "Content-type": 'application/x-www-form-urlencoded;charset=utf-8'
        },
        data: formdata,
        contentType: false,//告诉jQuery不要去设置Content-Type请求头
        processData: false,// 告诉jQuery不要去处理发送的数据
    })
}

// 获取二维码图片
// export function getQrImg(activeId){
//   // alert(0)
//   return instance1({
//     method: 'get',
//     url: `${config.getQrPre}/api?activityId=${activeId}`,
//     // contentType: false,//告诉jQuery不要去设置Content-Type请求头
//     // processData: false,// 告诉jQuery不要去处理发送的数据
//   })
//   .then(res => {
//     console.log('getQrImg', res);
//     if (res.status == 200) {
//       return res.data
//     } else {
//       throw Error('ajax 返回错误')
//     }
//   })
//   .catch(err => {
//     console.log('getQrImg err', err)
//     let msg = err.message.toString().toLowerCase()
//     if(msg.indexOf('network error') >= 0) {
//       throw Error('接口出了点问题，请稍候重试')
//     } else if(msg.indexOf('timeout') >= 0) {
//       throw Error('请求超时，请稍候重试')
//     }
//   })
// }

// 信息上报
// export function dataReport(){
//   // console.log(encodeURI(window.ZEPETO.userInfo.profilePic), '>>>',encodeURIComponent(window.ZEPETO.userInfo.profilePic));
//   // alert(0)
//   return instance1({
//     method: 'post',
//     headers: {
//       'Content-Type': 'application/json;charset=UTF-8'
//     },
//     // url: `${apiPre}/card/list?zzid=${encodeURIComponent(window.ZEPETO.userInfo.hashCode)}&titleId=7`
//     url: `http://api-zepeto-beta.kajicam.com/zepeto/activity/user/center/api/user-info/report`,
//     data: JSON.stringify({
//       authToken: encodeURIComponent(window.ZEPETO.userInfo.authToken),
//       device_id: encodeURIComponent(window.ZEPETO.duid),
//       nickName: encodeURIComponent(window.ZEPETO.userInfo.name),
//       profilePic: encodeURIComponent(window.ZEPETO.userInfo.profilePic),
//       // token:'',
//       userAgent: encodeURIComponent(window.ZEPETO.userAgent),
//       userId: encodeURIComponent(window.ZEPETO.userInfo.userId),
//       zzId: encodeURIComponent(window.ZEPETO.userInfo.hashCode),
//       imToken: ''
//     })
//   })
//   .then(res => {
//     console.log('==》dataReport suc', res);
//     if (res.status == 200) {
//       return res.data
//     } else {
//       throw Error('ajax 接口错误')
//     }
//   })
//   .catch(err => {
//     console.log('==dataReport>>', err);
//   })
// }

// function base64ToBlob(base64) {
//   console.log(base64.slice(0, 100))
//   console.log(base64.split(',')[1].slice(0, 100), window.atob)
//   let bytes = window.atob(base64.split(',')[1])
//   console.log('bytes.length',base64.split(',')[1])
//   let array = [];
//   for(let i = 0; i < bytes.length; i++){
//       array.push(bytes.charCodeAt(i));
//   }
//   return new Blob([new Uint8Array(array)], {type: 'image/jpeg'})
// }

// 二进制图片转图片
// 方法一
//
// 复制代码
// var uInt8Array = new Uint8Array(xhr.response);
// var i = uInt8Array.length;
// var binaryString = new Array(i);
// while (i--) {
//     binaryString[i] = String.fromCharCode(uInt8Array[i]);
// }
// var data = binaryString.join('');
//
// var imageType = xhr.getResponseHeader("Content-Type");
// $('#image').attr("src", "data:" + imageType + ";base64," + data)
// 复制代码
// 方法二
//
// var imageType = xhr.getResponseHeader("Content-Type");
// var blob = new Blob([xhr.response], { type: imageType });
// var imageUrl = (window.URL || window.webkitURL).createObjectURL(blob);
// $('#image').attr("src", imageUrl);
