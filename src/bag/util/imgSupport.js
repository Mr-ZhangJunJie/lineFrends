export default class imgSupport {
    static imageRule = {
        minWidth: 400,
        minHeight: 400,
        minRatio: 0.46,
        maxRatio: 2.2
    }

    static preloadImage(uri) {
        return new Promise((resolve, reject) => {
            let img = new Image()
            img.src = uri;
            // img.crossOrigin = 'anonyous'
            img.onload = function () {
                uri = null;
                resolve(this)
            }
            img.onerror = function () {
                uri = null;
                reject(new Error('img url not exist', uri))
            }
        })
    }

    // inputfile 转src = inputfile2url(files[0])
    static inputPath2url(file) {
        let url = null;
        if (window.createObjectURL != undefined) { // basic
            url = window.createObjectURL(file);
        } else if (window.URL != undefined) { // mozilla(firefox)
            url = window.URL.createObjectURL(file);
        } else if (window.webkitURL != undefined) { // webkit or chrome
            url = window.webkitURL.createObjectURL(file);
        }
        return url;
    }

    /**
     *  链接转二维码图片 el：jsdom 生成到这个节点
     *  需添加 import '@/bag/plugins/code'
     * @param el
     * @param url
     * @return {QRCode}
     */
    static createQr(el, url) {
        el.innerHTML = ''
        return new QRCode(el, {
            text: url,
            width: 128,
            height: 128,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        })
    }

    /**
     *  单独添加二维码
     * @param img   原图
     * @param qr     二维码
     * @param options    {cwidth: number, cheight: number, sx: number, sy: number, swidth: number, sheight: number,x:number,y:number,width:number,height:number}
     * @return {string}
     */
    static addQr(img, qr, options) {
        let canvas = document.createElement("canvas");
        let {cwidth, cheight, sx, sy, swidth, sheight, x, y, width, height} = options;
        canvas.style.width = `${cwidth}px`;
        canvas.style.height = `${cheight}px`;
        let context = canvas.getContext('2d');
        //  适配高倍屏
        // context.backingStorePixelRatio 浏览器用多少像素存储canvas尺寸，例如，屏幕用 200 * 200 的尺寸 存储 100 * 100 的图像，则值为 2
        let backingStore = context.backingStorePixelRatio ||
            context.webkitBackingStorePixelRatio ||
            context.mozBackingStorePixelRatio ||
            context.msBackingStorePixelRatio ||
            context.oBackingStorePixelRatio ||
            context.backingStorePixelRatio || 1;
        let ratio = (window.devicePixelRatio || 1) / backingStore; //定义任意放大倍数 支持小数
        let scale = ratio > 2 ? ratio : 2;

        canvas.width = cwidth * scale  //定义canvas 宽度 * 缩放
        canvas.height = cheight * scale  //定义canvas 高度 *缩放
        context.scale(scale, scale)  //获取context,设置scale

        context.mozImageSmoothingEnabled = false
        context.webkitImageSmoothingEnabled = false
        context.msImageSmoothingEnabled = false
        context.imageSmoothingEnabled = false

        context.drawImage(img, 0, 0, cwidth, cheight);

        context.drawImage(qr, sx, sy, swidth, sheight, x, y, width, height);
        return canvas.toDataURL('image/jpeg');
    }

    /**
     * 验证图片的尺寸
     * @param width
     * @param height
     * @return {boolean}
     */
    static validationImageSize(width, height) {
        if (width == 0 || height == 0) {
            return false
        }

        if (width < imgSupport.imageRule.minWidth || height < imgSupport.imageRule.minHeight) {
            return false
        }
        const imageRatio = width / height;
        if (imageRatio < imgSupport.imageRule.minRatio || imageRatio > imgSupport.imageRule.maxRatio) {
            return false
        }
        return true
    }

    /**
     * 将即将上传的图片裁切实用部分 图片展示框 用户可放大滑动 其实只用了中间部分裁取要上传的图片越小越好,在ezGesture功能后使用
     * @param $img jquery节点
     * @$dragArea 适配盒子
     * @return {Promise<any>}
     */
    static cutAutoImage($img,$dragArea) {
        return new Promise((resolve) => {
            let canvas = document.createElement('canvas');
            let ctx = canvas.getContext('2d');
            let backingStore = ctx.backingStorePixelRatio ||
                ctx.webkitBackingStorePixelRatio ||
                ctx.mozBackingStorePixelRatio ||
                ctx.msBackingStorePixelRatio ||
                ctx.oBackingStorePixelRatio ||
                ctx.backingStorePixelRatio || 1;

            let ratio = (window.devicePixelRatio || 1) / backingStore;
            let scale = ratio > 2 ? ratio : 2;


            // 看是否有必要降低清晰度
            ctx.mozImageSmoothingEnabled = false
            ctx.webkitImageSmoothingEnabled = false
            ctx.msImageSmoothingEnabled = false
            ctx.imageSmoothingEnabled = false
            let img = $img[0];
            //  缩放比
            let origin2AutoRatio = img.naturalWidth / $img.width();
            let dropAreaWidth = $dragArea[0].clientWidth;
            let dropAreaHeight = $dragArea[0].clientHeight;
            console.log(dropAreaWidth,dropAreaHeight)

            canvas.width = dropAreaWidth * scale;  //定义canvas 宽度 * 缩放
            canvas.height = dropAreaHeight * scale;  //定义canvas 高度 *缩放

            ctx.save();
            ctx.scale(scale,scale);
            let transform = _getTransform(img);
            let autoImgOffsetLeft = Math.abs(transform.translate.x);
            let autoImgOffsetTop = Math.abs(transform.translate.y);

            ctx.drawImage(img, autoImgOffsetLeft * origin2AutoRatio, autoImgOffsetTop * origin2AutoRatio, dropAreaWidth * origin2AutoRatio,dropAreaHeight * origin2AutoRatio, 0, 0, dropAreaWidth, dropAreaHeight)
            ctx.restore();
            resolve(canvas)
        })
    }
}

/**
 * 获取节点的transform值
 * @param Node
 * @return {{translate: {x: number, y: number}, scale: number}}
 */
function _getTransform(Node) {
    let str = Node.style.transform;
    str = str.trim();
    let arr = str.split(') ');
    let obj = {translate:{x:0,y:0},scale:1};
    for(let i =0,j = arr.length; i <j ; i++){
        if(arr[i].trim().startsWith('translate')){
            let pos = arr[i].split('(')[1].split(',');
            obj.translate = {
                x:parseFloat(pos[0]),
                y:parseFloat(pos[1])
            }
        }else if(arr[i].trim().startsWith('scale')){
            let sca = arr[i].split('(')[1];
            obj.scale = parseFloat(sca)
        }
    }
    return obj
}
