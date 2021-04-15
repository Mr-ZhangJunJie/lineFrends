import bridgeContext from "./bridgeContext";

export default class AbstractBridge {
    constructor() {
        return null;
    }

    static getInstance() {
        return null;
    }

    /**
     * Bridge 인스턴스 초기화
     * @private
     */
    _initInstance() {
      this.className = this.constructor.name//IosBridge
      this.fullName = bridgeContext.getB612NativeContext().namespace + '.' + this.className//B612.native.IosBridge
      this.callback = {};
      this.callback.fullName = this.fullName + '.callback'//B612.native.IosBridge.callback
      this._registerGlobal()
      /*
      this.callback =
      {
        fullName: B612.native.IosBridge.callback
      }
      */
    }

    /**
     * AndroidBridge를 native에서 callback 함수를 호출할 수 있도록 window 객체로 등록한다.
     * @param instance
     * @private
     */
    _registerGlobal() {
      // window['B612']['Native'].namespace = B612.Native
      // window['B612']['Native']['IosBridge'] = window['B612']['Native']['IosBridge'] || this
      bridgeContext.getB612NativeContext()[this.className] = bridgeContext.getB612NativeContext()[this.className] || this;
      /*
        window.B612.Native.IosBridge = this
        window.B612.Native.IosBridge = {
          className: 'IosBridge',
          fullName: 'B612.native.IosBridge',
          callBack: {
            fullName: B612.native.IosBridge.callback
          }
        }
      */
    }

    /**
     * 登记上传到对方名下的callback，重命名callback函数的full
     * @param callbackName : callback 回调的方法名
     * @param userCallback : client code指定的callback函数
     * @param resultType : bridge 호출 결과를 변환할 오브젝트 type을 지정하면 해당 type의 .from() 메소드를 호출해 변환한다.
     * @param additionalParams : userCallback 额外参数
     * @returns {string} : callback 返回函数的全称
     * @private
     */
    _registerCallback(callbackName, userCallback, resultType, ...additionalParams) {
      // B612.native.IosBridge.callback.appInfo =
      this.callback[callbackName] = (result) => {
          this._logResult(result, callbackName)
          let resultParsed = resultType ? resultType.from(result) : result//{app, os, deviceModel, language, country}
          userCallback.apply(undefined, [resultParsed, ...additionalParams]);
      }
      /*
      this.callback =
      {
        appInfo: (result) => {

        }
      }
      ==>
      window.B612.Native.IosBridge = this
      window.B612.Native.IosBridge = {
        className: 'IosBridge',
        fullName: 'B612.native.IosBridge',
        callBack: {
          fullName: B612.native.IosBridge.callback,
          appInfo: (result) => {

          }
        }
      }
      */
      return this._makeNativeCallbackName(callbackName)//B612.native.IosBridge.callback.appInfo
    }

    /**
     * app에서 호출할 callback 메소드명을 namespace를 포함한 full 접근명으로 변환하여 리턴한다.
     * @param methodName
     * @returns {string}
     * @private
     */
    _makeNativeCallbackName(methodName) {
      // B612.native.IosBridge.callback.appInfo
      return this.callback.fullName + '.' + methodName;
    }

    /**
     * app에서 callback으로 전달받은 result json을 parsing하여 logging 한다.
     * @param result
     * @param callbackName : 로깅할 callbackName 명칭
     * @private
     */
    _logResult(result, callbackName) {
        let _result = result;
        if (typeof result === 'string') {
            _result = result.substring(0, 1000);
        }
        //alert(`[Native callback][${callbackName}] : ${_result}`);
        console.log(`[Native callback][${callbackName}] : ${_result}`);
    }

    printThis() {
        console.log('--- print this below --- ');
        console.log(this);
        console.log('--- end of print this --- ');
    }
}
