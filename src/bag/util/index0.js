export default class ut{
  static browserPrevent() {
    // 禁止双击缩放
    var lastTouchEnd = 0
    document.documentElement.addEventListener('touchend', function (event) {
      var now = Date.now()
      if (now - lastTouchEnd <= 300) {
        event.preventDefault()
      }
      lastTouchEnd = now
    }, false)
    // 禁止ios双指缩放
    document.addEventListener('gesturestart', function (event) {
      event.preventDefault()
    });
  }
  // 检查日期是否为今天
  static isToday(str) {
      if (new Date(str).toDateString() === new Date().toDateString()) {
        console.log("当天")
        return true
      } else if (new Date(str) < new Date()){
        console.log("以前的日期")
        return false
      }
  }
  // 懒加载js文件
  static _load(src, cb) {
      var s = document.createElement('script')
      if (s.readyState) {
          s.onreadystatechange = function(){
              if (s.readyState == 'loaded' || s.readyState == 'complete') {
                  s.onreadystatechange = null
                  cb && cb()
              }
          }
      } else {
          s.onload = function(){
            cb && cb()
          }
      }
      s.src = src
      document.getElementsByTagName('head')[0].appendChild(s)
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

  // this.$ut.cancelInput(document.documentElement.scrollTop || document.body.scrollTop)
  // document.querySelector('body').style.height = '1499px';
  // setTimeout(() => {
  //    document.body.scrollTop = document.documentElement.scrollTop = this.$refs['p1'].offsetHeight * .4
  // }, 20)
  // <input type="text" name="" @focus="resizeFn" value="" placeholder="输入崽崽ID" ref="zepetoId" class="text">
  static cancelInput(scrolltop) {
    // 取消软键盘 ios托起页面bug
    document.body.addEventListener('focusout', function addHandler() {
      setTimeout(() => {
        var currentPosition, timer;
        timer = setInterval(() => {
          currentPosition = scrolltop || document.documentElement.scrollTop || document.body.scrollTop
          if (currentPosition > scrolltop) {
            window.scrollTo(0, Math.floor(currentPosition * 0.05));
          } else {
            window.scrollTo(0, scrolltop)
            document.body.removeEventListener('focusout', addHandler)
            document.body.style.height = '100%'
            clearInterval(timer)
          }
        }, 30)
      }, 400)
    })
  }
}
