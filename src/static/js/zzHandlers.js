// import SaveShareParam from "@/bag/bridge/param/SaveShareParam.js"
import Bridge from '@/bag/zaizaiJsBridge'
// import EventCameraParam from '@/bag/bridge/param/EventCameraParam'
import BrowserChecker from '@/bag/util/BrowserChecker'
// import EXIF from 'exif-js'
// import MegaPixImage from '@/bag/plugins/megapix-image'
// import '@/bag/plugins/EZGesture'
// import imgSupport from '@/bag/util/imgSupport'
// import '@/bag/plugins/canvas2image'
// import config from '@/config/index'
// import cameraMenu from '@/bag/vueCommon/cameraMenu/1/c'
// import loading from '@/bag/vueCommon/loading/1/loading'

 // 项目名+站内外 统计用
let eventBaseName = '2019fashionTrend'
let EventFullPath = ""
let cropGesture = null//拖动缩放功能

export default class Handlers {
  // 初始化基本状态
  static myApp = {
   inState: '-outApp',
   isInApp: false,
   version: '',
   dpr: window.devicePixelRatio,
   EventFullPath: `${eventBaseName}-outApp`
  }

  // 检测app基本信息
  static checkAppInfo(cb) {
    console.log('>>checkAppInfo')
    if (BrowserChecker.isIos()) {
      Handlers.assignMyApp({isIos: true})
    } else if (BrowserChecker.isAndroid()) {
      Handlers.assignMyApp({isAnd: true})
    }
    Handlers.assignMyApp({EventFullPath: eventBaseName + Handlers.myApp.inState})
    console.log('eventBaseName', eventBaseName);
    EventFullPath = Handlers.EventFullPath
    Bridge.WaitZEPETO(() => {
      let o = {
        isInApp : true,
        inState : '-inApp'
      }
      Handlers.assignMyApp(o)
      Handlers.assignMyApp({EventFullPath: eventBaseName + Handlers.myApp.inState})
      EventFullPath = Handlers.EventFullPath
      if(cb)cb()
      // 是否隐藏webview导航栏
      // Bridge.titleBarVisible()
    })
  }

  // 当有状态改变  修改基本信息
  static assignMyApp(obj) {
    Handlers.myApp = Object.assign({}, Handlers.myApp, obj)
  }
}
