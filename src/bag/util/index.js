export default class ut {
  // 本地存储
  static lStoragePut(key, value){
      //将对象转化成json字符串，存入sessionStorage
      localStorage.setItem(key, JSON.stringify(value));
  }
  // 获取
  static lStorageGet(key, isRemove){
    if (localStorage.getItem(key) == 'undefined'){
      return ''
    }
      //从sessionStorage中取出json字符串，然后将json字符串转化成对象,并返回.
      var result = JSON.parse(localStorage.getItem(key));
      // 删除
      if (isRemove){
          localStorage.removeItem(key);
      }
      return result;
  }
  // 检查url中是否有参数name
  static getQueryString(name) {
    var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i')
    var r = window.location.search.substr(1).match(reg)
    if (r != null) return decodeURIComponent(r[2])
    return null
  }
  // 检测用户名长度 中文1 英文.5字符长度
  static getCodelength(s){
      var charLength = 0;
      for (var i = 0; i < s.length; i++){
          var sonChar = s.charAt(i);
          encodeURI(sonChar).length > 2 ? charLength += 1 : charLength += 0.5;
      }
      return charLength
  }

  // 检测用户输入非emoji表情
  static checkEmoji(s) {
    var regRule = /\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDE4F]/g;
    console.log(regRule.test(s));
    return regRule.test(s)
  }

  static checkPhone(_val) {
    let val = _val.trim()
    if (val.trim().length == 0) {
      throw new Error('请输入手机号')
    } else if (!(/^1(3|5|7|8|9)\d{9}$/.test(val))) {
      throw new Error('请输入有效的手机号')
    }
  }

  static checkUserName(_val, limitLenth) {
    if (/\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDE4F]/g.test(_val)) {
      throw new Error('姓名格式不支持')
    } else if (_val.trim().length == 0) {
      throw new Error('请输入姓名')
    } else if (ut.getCodelength(_val.trim()) > limitLenth) {
      throw new Error('姓名最长支持4个字')
    }
  }
  // ios页面双击放大
  static preventDoubleClick() {
    var lastTouchEnd = 0;
    document.documentElement.addEventListener('touchend', function (event) {
        var now = Date.now();
        if (now - lastTouchEnd <= 300) {
            event.preventDefault();
        }
        lastTouchEnd = now;
    }, false);
  }

  // 对比俩个版本号 app
  static compareVersion(a, b){
    for (let i in b) {
      let cur = parseInt(b[i], 10) || 0
      let limit = parseInt(a[i], 10) || 0
      if (cur > limit) {
        return true
      } else if (cur < limit) {
        return false
      }
    }
    return false
  }
}
