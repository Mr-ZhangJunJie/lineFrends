// import html2canvas from 'html2canvas'
// import html2canvas from '@/bag/plugins/html2canvas/0.5.0-beta4'
// import html2canvas from '@/bag/plugins/html2canvas/050beta4.min'
// import '@/bag/plugins/html2canvas-0.4.1'
/*
支持图片圆角 需用
    var pattern = context.createPattern(image, "no-repeat");
    // 绘制一个圆
    context.roundRect(0, 0, image.width, image.height, input.value * 1 || 0);
    // 填充绘制的圆
    context.fillStyle = pattern;
    context.fill()
*/
// CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
//     var minSize = Math.min(w, h);
//     if (r > minSize / 2) r = minSize / 2;
//     // 开始绘制
//     this.beginPath();
//     this.moveTo(x + r, y);
//     this.arcTo(x + w, y, x + w, y + h, r);
//     this.arcTo(x + w, y + h, x, y + h, r);
//     this.arcTo(x, y + h, x, y, r);
//     this.arcTo(x, y, x + w, y, r);
//     this.closePath();
//     return this;
// }

export default class imgSupport{
  static imageRule = {
      minWidth: 235,
      minHeight: 200,
      minRatio: 0.46,
      maxRatio: 2.2
  }
  static preloadImage(uri) {
    return new Promise((resolve, reject) => {
      let img = new Image()
      img.src = uri
      // img.crossOrigin = 'anonyous'
      img.onload = function(){
        img = null;
        resolve(this)
      }
      img.onerror = function(){
        img = null;
        reject(new Error('img url not exist', uri))
      }
    })
  }
  // inputfile 转src = inputfile2url(files[0])
  static inputPath2url(file) {
      var url = null;
      if (window.createObjectURL != undefined) { // basic
          url = window.createObjectURL(file);
      } else if (window.URL != undefined) { // mozilla(firefox)
          url = window.URL.createObjectURL(file);
      } else if (window.webkitURL != undefined) { // webkit or chrome
          url = window.webkitURL.createObjectURL(file);
      }
      return url;
  }
  // 链接转二维码图片 el：jsdom 生成到这个节点
  // 需添加 import '@/bag/plugins/code'
  // new QRCode(document.getElementById('qrcode'), 'your content');
  static createQr(el, url) {
    el.innerHTML = ''
    return new QRCode(el, {
      text: url,
      width: 128,
      height: 128,
      colorDark : "#000000",
      colorLight : "#ffffff",
      correctLevel : QRCode.CorrectLevel.H
    })
    // $(el).find('img')[0].crossOrigin = 'Anonyous'
  }
  // 给图片上添加二维码
  static addQr(_this){
    var canvas = document.createElement("canvas");
    canvas.style.width = '750px'
    canvas.style.height = '1000px'
    var context = canvas.getContext('2d')
    var backingStore = context.backingStorePixelRatio ||
                context.webkitBackingStorePixelRatio ||
                context.mozBackingStorePixelRatio ||
                context.msBackingStorePixelRatio ||
                context.oBackingStorePixelRatio ||
                context.backingStorePixelRatio || 1;
    var ratio = (window.devicePixelRatio || 1) / backingStore; //定义任意放大倍数 支持小数
    var scale = ratio > 2 ? ratio : 2;
    canvas.width = 750 * scale//定义canvas 宽度 * 缩放
    canvas.height = 1000 * scale//定义canvas 高度 *缩放
    context.scale(scale, scale)//获取context,设置scale
    context.mozImageSmoothingEnabled = false
    context.webkitImageSmoothingEnabled = false
    context.msImageSmoothingEnabled = false
    context.imageSmoothingEnabled = false

    context.drawImage(_this, 0, 0, 750, 1000);
    // context.drawImage(code, 0, 0, 260, 260, 602, 852, 135, 135);
    context.drawImage(qr, 0, 0, 260, 260, 13, 856, 132, 132);
    return Canvas2Image.convertToJPEG(canvas, canvas.width, canvas.height);
    // return _img
  }
  static validationImageSize(width, height) {
    // console.log(width, height);
      if (width == 0 || height == 0) {
          return false
      }
      // if (width >= height && height < imgSupport.imageRule.minWidth) {
      // alert(imgSupport.imageRule.minWidth)
      //   alert(height < imgSupport.imageRule.minHeight)
      //   alert(width < imgSupport.imageRule.minWidth)
      if ((width >= height && height < imgSupport.imageRule.minHeight) || (width >= height && width < imgSupport.imageRule.minWidth) ) {
          // Logger.error("too small image: width " + width, 5);
          return false
      }
      if (width < height && width < imgSupport.imageRule.minWidth) {
          // Logger.error("too small image: height " + height, 5);
          return false
      }
      const imageRatio = width / height;
      if (imageRatio < imgSupport.imageRule.minRatio || imageRatio > imgSupport.imageRule.maxRatio) {
          // Logger.error("invalid image ratio: " + imageRatio, 5);
          return false
      }
      return true
  }
  /*
    将即将上传的图片裁切实用部分 图片展示框 用户可放大滑动 其实只用了中间部分裁取要上传的图片越小越好
    在ezGesture功能后使用
  */
  static cutAutoImage(src) {
        return new Promise((resolve,reject) => {
            let drawCanvas = document.createElement('canvas')
            let ctx = drawCanvas.getContext('2d')
            var backingStore = ctx.backingStorePixelRatio ||
                ctx.webkitBackingStorePixelRatio ||
                ctx.mozBackingStorePixelRatio ||
                ctx.msBackingStorePixelRatio ||
                ctx.oBackingStorePixelRatio ||
                ctx.backingStorePixelRatio || 1;
            var ratio = (window.devicePixelRatio || 1) / backingStore;

            let dropAreaWidth = $('#dragArea')[0].clientWidth
            let dropAreaHeight = $('#dragArea')[0].clientHeight

            // console.log(dropAreaWidth, dropAreaHeight)

            let img = new Image()
            img.src = src
            // img.crossorigin = 'Anonymous'
            img.onload = function () {
                //  缩放比
                var origin2AutoRatio;
                // console.log('Amy>>>>>>>>>>>>>>>>')
                // console.log(parseFloat($('#selectArea').offset().width))
                // console.log(parseFloat($('#selectArea').offset().height))
                // console.log(parseFloat($('#dragImg').offset().width))
                // console.log(parseFloat($('#dragImg').offset().height))

                if ($('#dragImg').css('width') == '100%'){
                    origin2AutoRatio = this.width / parseFloat($('#dragImg').offset().width)
                } else {
                    origin2AutoRatio = this.height / parseFloat($('#dragImg').offset().height)
                }
                // console.log(this.width)
                // console.log(this.width)

                let autoImgOffsetLeft = Math.abs(parseFloat($('#dragImg').css('left')))
                let autoImgOffsetTop = Math.abs(parseFloat($('#dragImg').css('top')))

                // drawCanvas.style.width = (dropAreaWidth - 1) + 'px'
                drawCanvas.style.width = 750 + 'px'
                // drawCanvas.style.height = dropAreaHeight + 'px'
                drawCanvas.style.height = 562 + 'px'
                var scale = ratio > 2 ? ratio : 2;
                // var scale = 2;
                drawCanvas.width = 750;
                // drawCanvas.width = (dropAreaWidth - 1) * scale
                // drawCanvas.height = dropAreaHeight * scale
                drawCanvas.height = 562;
                // ctx.scale(scale, scale)
                // 看是否有必要降低清晰度
                // ctx.mozImageSmoothingEnabled = false
                // ctx.webkitImageSmoothingEnabled = false
                // ctx.msImageSmoothingEnabled = false
                // ctx.imageSmoothingEnabled = false

                ctx.drawImage(this, autoImgOffsetLeft * origin2AutoRatio, autoImgOffsetTop * origin2AutoRatio, dropAreaWidth * origin2AutoRatio, dropAreaHeight * origin2AutoRatio, 0, 0, drawCanvas.width, drawCanvas.height)

                // let img = Canvas2Image.convertToJPEG(drawCanvas, dropAreaWidth * scale, dropAreaHeight * scale)
                // var _img = new Image();
                // _img.src = img.src;
                // _img.setAttribute('crossOrigin', 'Anonymous')
                // _img.onload = function(){
                resolve(drawCanvas)
                    // console.log('CutAutoImage length:', img.src.length, 'scale:', scale, 'ratio:', ratio, img.width, img.height);
                // }
            }
            img.onerror = function (){
                loading({state: 0})
                return reject()
            }
        })
    }
  /*
    imgs to canvas 绘图
    保证target的向外距离不是受flex布局影响 内部可以用flex
    保证target尺寸够大，有必要可以先clone 放大保证图片质量
    制作多张有背景图的，容易超出栈内存，换成图片即可
  */
  static _html2canvas(target){
    var shareContent = target//需要截图的包裹的（原生的）DOM 对象
    var width = shareContent.offsetWidth //获取dom 宽度
    var height = shareContent.offsetHeight //获取dom 高度
    var canvasDom = document.createElement('canvas')//创建一个canvas节点
    var context = canvasDom.getContext('2d')
    // var backingStore = context.backingStorePixelRatio ||
    //     context.webkitBackingStorePixelRatio ||
    //         context.mozBackingStorePixelRatio ||
    //         context.msBackingStorePixelRatio ||
    //         context.oBackingStorePixelRatio ||
    //         context.backingStorePixelRatio || 1;
    // var scale = (window.devicePixelRatio || 1) / backingStore//定义任意放大倍数 支持小数
    var scale = 1.5
    canvasDom.style.width = width + 'px'//定义canvas 宽度 * 缩放
    canvasDom.style.height = height + 'px'//定义canvas高度 *缩放
    canvasDom.width = width * scale//定义canvas 宽度 * 缩放
    canvasDom.height = height * scale//定义canvas高度 *缩放
    context.scale(scale, scale)//获取context,设置scale
    var opts = {
        scale: scale, // 添加的scale 参数
        canvas: canvasDom, //自定义 canvas
        logging: false, //日志开关，便于查看html2canvas的内部执行流程
        width: width, //dom 原始宽度
        height: height,
        useCORS: true, // 【重要】开启跨域配置,
        // allowTaint: true,//允许加载跨域的图片
        // tainttest:true, //检测每张图片都已经加载完成
        // removeContainer:false,
        windowHeight: document.body.scrollHeight,
        // x:0,
        y:window.pageYOffset,

        // onrendered: function(canvas) {
        //【重要】关闭抗锯齿
        //   var context = canvas.getContext('2d')
        //   context.mozImageSmoothingEnabled = false
        //   context.webkitImageSmoothingEnabled = false
        //   context.msImageSmoothingEnabled = false
        //   context.imageSmoothingEnabled = false
        //   if(cb) {
        //     cb(Canvas2Image.convertToJPEG(canvas).src)
        //   }
        // }
    }
    return html2canvas(target, opts).then(canvas => {
      // var context = canvasDom.getContext('2d')
      // context.mozImageSmoothingEnabled = false
      // context.webkitImageSmoothingEnabled = false
      // context.msImageSmoothingEnabled = false
      // context.imageSmoothingEnabled = false
      return Canvas2Image.convertToJPEG(canvas).src
    }).catch(err => {
      console.log('html2canvas err:', err);
    })
  }
}
