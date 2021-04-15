import AbstractBridge from "./AbstractBridge"
import ConfigFactory from "@/config/index"
import AppInfo from "./model/AppInfo"
// import UserInfo from "./model/UserInfo"
import AppCommonResult from "./model/AppCommonResult"
import CameraResult from "./model/CameraResult"
// import VideoResult from "./model/VideoResult"
// import BrowserChecker from "./tools/BrowserChecker"

let instance = null;

export default class IosBridge extends AbstractBridge {
    constructor() {
        super()
        if (!instance) {
            instance = this;
            super._initInstance(instance);
        }
        return instance;
    }

    /**
    * app 内通过回调获取基本信息 3.3.0
    * callBack返回 {app, os, deviceModel, language, country, duid}
    * @param userCallback
    *    : callback param 0 - ./model/AppInfo
    */
    appInfo(userCallback) {
        const callbackMethodFullName = this._registerCallback("appInfo", userCallback, AppInfo);
        this._calliOSFunction("appInfo", null, callbackMethodFullName);
    }

    /**
     * 保存媒体成功 3.3.5
     * 调用成功后才执行callback
     * @param saveShareParam (@see ./param/SaveShareParam)
     * @param userCallback
     */
    save(saveShareParam, userCallback) {
        const callbackMethodFullName = this._registerCallback("save", userCallback, AppCommonResult);
        this._calliOSFunction("save", saveShareParam, callbackMethodFullName);
    }


    // /**
    // * 只分享图片 3.3.5
    // * 调用成功后才执行callback
    // * weibo hashtag param 追加关键词
    // * @param saveShareParam (@see ./param/SaveShareParam)
    // * @param sharePoppedCallback - app在分享div를 보여준 후 호출되는 callback
    // * @param shareMediaClickedCallback - app에서 share 매체를 선택한 후 callback (호출되지 않는데 ??)
    // */
    // shareImage(saveShareParam, sharePoppedCallback, shareMediaClickedCallback) {
    //   const sharePoppedCallbackName = this._registerCallback('sharePoppedCallback', sharePoppedCallback, AppCommonResult);
    //   const shareMediaClickedCallbackName = this._registerCallback('shareMediaClickedCallback', shareMediaClickedCallback, AppCommonResult);
    //
    //   const options = JSON.parse(saveShareParam.toString())
    //   options.clickShareButton = shareMediaClickedCallbackName;
    //   this._calliOSFunction("shareImage", options, sharePoppedCallbackName);
    // }

    /**
    * 分享并保存媒体 3.3.5
    * 调用成功后才执行callback
    * 支持分享图片、视频、web网页（支持标题、内容、图标、链接）
    * @param saveShareParam (@see ./param/SaveShareParam)
    * @param sharePoppedCallback - app에서 공유 div를 보여준 후 호출되는 callback
    * @param shareMediaClickedCallback - app에서 share 매체를 선택한 후 callback (호출되지 않는데 ??)
    */
    shareWithCallback(saveShareParam, sharePoppedCallback, shareMediaClickedCallback) {
        const sharePoppedCallbackName = this._registerCallback('sharePoppedCallback', sharePoppedCallback, AppCommonResult);
        const shareMediaClickedCallbackName = this._registerCallback('shareMediaClickedCallback', shareMediaClickedCallback, AppCommonResult);

        const options = JSON.parse(saveShareParam.toString())
        options.clickShareButton = shareMediaClickedCallbackName;
        this._calliOSFunction("share", options, sharePoppedCallbackName);
    }

    /**
    * 从相册或拍照选取照片或打开相机选中返回图片 3.3.5
    * 调用成功后callback(object, type) object:{ base64Image:...., landmarks: ....} type:imageCamera or imageAlbum
     * @param eventCameraParam (@see ./param/EventCameraParam)
     * @param userCallback
     */
    eventCamera(eventCameraParam, userCallback) {
        const callbackMethodFullName = this._registerCallback("eventCamera", userCallback,
            CameraResult, eventCameraParam.type, eventCameraParam.cameraPosition)
        this._calliOSFunction("eventCamera", eventCameraParam, callbackMethodFullName)
    }
    /*
      带有landmarks的eventCamera 7.6.0支持
    */
    // eventCameraWithLandmarks(eventCameraParam, userCallback) {
    //   if (BrowserChecker.appVersionLessThan([7, 6, 0])){
    //     console.log('eventCameraWithLandmarks 7.6.0支持')
    //   }
    //   const callbackMethodFullName = this._registerCallback("eventCameraWithLandmarks", userCallback,
    //       CameraResult, eventCameraParam.type, eventCameraParam.cameraPosition)
    //
    //   this._calliOSFunction("eventCameraWithLandmarks", eventCameraParam, callbackMethodFullName)
    // }

    // /**
    // * 6.5.3
    // *  把进入页面前拍摄的照片带入h5页面，一般是通过confirmbanner配置的h5进入才可获取
    // * @param userCallback
    // */
    // getCameraImage(userCallback) {
    //     const callbackMethodFullName = this._registerCallback("getCameraImage", userCallback, CameraResult);
    //     this._calliOSFunction("getCameraImage", null, callbackMethodFullName);
    // }
    // /**
    // * 7.6.0
    // * 带有getCameraImage的getCameraImage
    // */
    // getCameraImageWithLandmarks(userCallback) {
    //     const callbackMethodFullName = this._registerCallback("getCameraImageWithLandmarks", userCallback, CameraResult);
    //     this._calliOSFunction("getCameraImageWithLandmarks", null, callbackMethodFullName);
    // }

    /*
    关闭当前h5所在的webview 6.5.3支持
    */
    close() {
      // if (BrowserChecker.appVersionLessThan([6, 5, 3])){
      //   console.log('关闭当前h5所在的webview 6.5.3支持')
      // }
      this._calliOSFunction("close", null, null);
    }
    /*
   隐藏title区域 3.3.5支持 调用默认为关闭功能
    */
    titleBarVisible(isVisible = false) {
      // if (BrowserChecker.appVersionLessThan([7, 10, 1])){
      //   console.log('隐藏title区域 7.10.1支持')
      // }
      this._calliOSFunction("titleBarVisible", {"isVisible":isVisible});
    }
    /*
    8.7.0
    userSeq(Unique key), isMobileVerified(手机认证信息),
    userId(是否登陆),
    userM 手机hash值
    userSeq(Unique key), isMobileVerified(手机认证信息),
    userId(是否登陆)
    等所有用户信息通过Json传
    */
    // getUserSession(userCallback){
    //   const callbackMethodFullName = this._registerCallback("getUserSession", userCallback, UserInfo);
    //   this._calliOSFunction("getUserSession", null, callbackMethodFullName);
    // }
    /*
    8.7.0
    */
    // loginWithSession(userCallback){
    //   const callbackMethodFullName = this._registerCallback("loginWithSession", userCallback, UserInfo);
    //   this._calliOSFunction("loginWithSession", null, callbackMethodFullName);
    // }
    /*
    8.7.0
    */
    // verifyPhoneWithSession(userCallback){
    //   const callbackMethodFullName = this._registerCallback("verifyPhoneWithSession", userCallback, UserInfo);
    //   this._calliOSFunction("verifyPhoneWithSession", null, callbackMethodFullName);
    // }
    // /**
    //  * @param VideoResultParam (@see ./param/VideoResultParam)
    //  * @param userCallback
    //  */
     /*
     8.7.0
     VideoParam:  @/param/VideoParam
     */
    // selectVideoAndUpload(VideoParam, userCallback){
    //   // _registerCallback 注册回调
    //   const callbackMethodFullName = this._registerCallback("selectVideoAndUpload", userCallback, VideoResult)
    //   console.log(callbackMethodFullName, callbackMethodFullName);
    //   this._calliOSFunction("selectVideoAndUpload", VideoParam, callbackMethodFullName)
    // }
    /*
    8.7.0
    */
    // takeVideoAndUpload(options, userCallback){
    //   const callbackMethodFullName = this._registerCallback("takeVideoAndUpload", userCallback, VideoResult)
    //   this._calliOSFunction("takeVideoAndUpload", options, callbackMethodFullName);
    // }

    /**
     * ios app启动方法 method
     * (app scheme)
     *
     * @param functionName - app启动的function name
     * @param args - 转达的 argument object
     * @param sCallback - app 返回的 callback
     * @private
     */
    _calliOSFunction(functionName, args, sCallback) {
        let url = ConfigFactory.scheme + "native/"
        const callInfo = {};
        callInfo.functionName = functionName;
        if (sCallback) {
            callInfo.success = sCallback;
        }
        if (args) {
            callInfo.args = args;
        }
        url += JSON.stringify(callInfo);

        this._openCustomURLinIFrame(url);
    }

    _openCustomURLinIFrame(src) {
        const rootElm = document.documentElement;
        const newFrameElm = document.createElement("IFRAME");

        newFrameElm.setAttribute("src", src);
        rootElm.appendChild(newFrameElm);
        // console.log("src", src)
        newFrameElm.parentNode.removeChild(newFrameElm);
    }
}
