import SaveShareParam from "@/bag/bridge/param/SaveShareParam.js"
import Bridge from '@/bag/bridge/BridgeFactory'
import EventCameraParam from '@/bag/bridge/param/EventCameraParam'
import BrowserChecker from '@/bag/util/BrowserChecker'
import EXIF from 'exif-js'
import '@/bag/plugins/EZGesture'
import imgSupport from '@/bag/util/imgSupport'

 // 项目名+站内外 统计用
let eventBaseName = 'lineFriend';
let EventFullPath = `${eventBaseName}-outApp`;;
let cropGesture = null;//拖动缩放功能
let setTimer;

let currentResolve; // 记录 相册、相机按钮点击时执行函数中的 回调函数参数

// Bridge.titleBarVisible(false)
setTimeout(()=>{
    if(window.navigator.userAgent.match(/foodle/i) && !Handlers.myApp.version){
        let ob = {
            isInApp : true,
            inState : '-inApp'
        };
        ob.needUpdata = true;
        Handlers.assignMyApp(ob);
        Handlers.assignMyApp({EventFullPath: eventBaseName + Handlers.myApp.inState});
        EventFullPath = Handlers.myApp.EventFullPath;
        console.log('在站内')
    }
    console.log('Handlers.myApp',Handlers.myApp)
},400);

export default class Handlers {

    /**
     * 初始化基本状态
     * @type {{inState: string, isInApp: boolean, version: string, dpr: number, EventFullPath: string, needUpdata: boolean}}
     */
    static myApp = {
        inState: '-outApp',
        isInApp: false,
        version: '',
        dpr: window.devicePixelRatio,
        EventFullPath: `${eventBaseName}-outApp`,
        needUpdata: false
    };

    /**
     * 检测app基本信息
     * @return {Promise<any>}
     */
    static checkAppInfo() {
        console.log('>>checkAppInfo');
        return new Promise((resolve)=>{
            if (BrowserChecker.isIos()) {
                assignMyApp({isIos: true})
            } else if (BrowserChecker.isAndroid()) {
                assignMyApp({isAnd: true})
            }

            Bridge.appInfo(res => {
                if (res.app) {
                    let o = {
                        isInApp: true,
                        version: res.app,
                        inState: '-inApp'
                    };
                    // 如果有版本，且小于3.3.5的
                    if (!compareVersion('3.3.5', res.app)) {
                        o.needUpdata = true;
                    }

                    assignMyApp(o);
                    assignMyApp({EventFullPath: eventBaseName + Handlers.myApp.inState});
                    EventFullPath = Handlers.myApp.EventFullPath;
                    console.log('在站内');
                }
                resolve();
                // 是否隐藏webview导航栏
                // Bridge.titleBarVisible()
            })
        })
    }


    /**
     * 选取照片
     * @return {Promise<any>}
     */
    static pickImg() {
        return new Promise(async resolve => {
            // 动态赋值最新的resolve用户下边节点绑定事件触发时获取最新的resolve
            currentResolve = resolve;
            if (Handlers.myApp.isInApp) {
                // cameraMenu();
                // let $galleryBtn = $("#galleryBtn"), $cameraBtn = $('#cameraBtn');
                // if(!Handlers.isHasEvent($galleryBtn,'click')){
                //     Handlers.addEvent($galleryBtn,'click');
                //     $galleryBtn.on('click', () => {
                        loading();
                        // cameraMenu({state: 0});
                        const galleryParams = new EventCameraParam({type: 'imageAlbum'})
                        _hmt.push(['_trackEvent', EventFullPath, 'Btn', '相册选取照片'])
                        Bridge.eventCamera(galleryParams, function (res) {
                            Handlers.eventCameraCallback(res, currentResolve)
                        })
                //     })
                // }
                // if(!Handlers.isHasEvent($cameraBtn,'click')){
                //     Handlers.addEvent($cameraBtn,'click');
                //     $cameraBtn.on('click', () => {
                //         loading();
                //         cameraMenu({state: 0})
                //         setTimer = setTimeout(() => {
                //             loading({state: 0});
                //         }, 1200)
                //         const cameraParams = new EventCameraParam({type: 'imageCamera'})
                //         _hmt.push(['_trackEvent', EventFullPath, 'Btn', '拍照选取照片'])
                //         Bridge.eventCamera(cameraParams, function (res) {
                //             Handlers.eventCameraCallback(res, currentResolve)
                //         })
                //     })
                // }
            } else {
                /*
                  站外input如果没有选取照片，无法捕捉onchange事件回调，不要提前加loading效果
                */
                let $inputFile = $('#inputFile') ;
                $inputFile[0].value = '';
                $inputFile.trigger('click');
                if(!Handlers.isHasEvent($inputFile,'change')){
                    Handlers.addEvent($inputFile,'change');
                    $('#inputFile').on('change', function () {
                        return Handlers.fileChanged.call(this, currentResolve)
                    })
                }
            }
        })
    }

    /**
     * 站内 拍照、选图的回调
     * @param res   //App相应的内容
     * @param resolve  // 回调函数
     */
    static eventCameraCallback(res, resolve){
        if (res.success) {
            let img = new Image()
            img.onload = function () {
                let imageType = this.src.split(",")[0].split(";")[0].split(":")[1].toLowerCase();
                let imageTypeCheck = imageType.includes("jpg") || imageType.includes("jpeg") || imageType.includes("png")
                if (!imgSupport.validationImageSize(this.width, this.height)) {
                    clearTimeout(setTimer);
                    return resolve({errMsg: '图片过小，请重选图片'})
                } else if (!imageTypeCheck) {
                    clearTimeout(setTimer);
                    return resolve({errMsg: '图片格式不符合'})
                }
                Handlers.renderFileChangedImg(this)
                    .then((canvas) => {
                        setTimeout(function () {
                            img = null;
                        },1000);
                        resolve(canvas)
                    })
            }
            img.src = res.base64Image;
            img.onerror = function () {
                return resolve({errMsg: '请检查网络连接'})
            }
        } else {
            resolve()
        }
    }

    /**
     * 站外 选图的回调
     * @param resolve
     * @return {*}
     */

    static fileChanged(resolve){
        loading();
        if (this.files.length <= 0){
            return resolve()
        }
        let img = new Image()
        img.onload = function () {
            if (!imgSupport.validationImageSize(this.width, this.height)) {
                return resolve({errMsg: '图片过小，请重选图片'})
            }
            // 优化站外合理限制图片尺寸最大不超过1980
            Handlers.renderFileChangedImg(this)
                .then((src) => {
                    setTimeout(function () {
                        img = null;
                    },1000);
                    resolve(src)
                })
        }
        img.src = imgSupport.inputPath2url(this.files[0])
    }

    /**
     * 给图片绑定缩放和平移操作
     * @param $showPicArea    // 操作平面层
     * @param $dragImg        // 操作的图片
     */
    static ezGesture($showPicArea,$dragImg){
        let dragImgRatio = $dragImg[0].naturalWidth / $dragImg[0].naturalHeight;
        console.log('dragImgRatio',dragImgRatio);
        //clientWidth 获取节点除边框外的尺寸，没有单位度量
        let showPicAreaRatio = ($showPicArea[0].clientWidth / $showPicArea[0].clientHeight).toFixed(3);
        // cropGesture && cropGesture.unbindEvents(); //取消上次的监听
        if(dragImgRatio > showPicAreaRatio){
            $dragImg.css({'width': 'auto', 'height': '100%'});
            setTimeout(function () {
                $('.dragArea').css('opacity', 1);
                $dragImg.css({'transform':`translate(${-($dragImg.width() - $showPicArea[0].clientWidth)>>1}px,0)`});
            },50)
        }else{
            $dragImg.css({'height': 'auto', 'width': '100%'});
            setTimeout(function () {
                $('.dragArea').css('opacity', 1);
                $dragImg.css({'transform':`translate(0,${-($dragImg.height() - $showPicArea[0].clientHeight)>>1}px)`});
            },50)
        }
        cropGesture = new EZGesture($showPicArea[0],$dragImg[0]);
    }

    // 释放图片拖放功能
    static unbindEventsEzGesture() {
        cropGesture && cropGesture.unbindEvents()
    }

    /**
     * 处理旋转图片的兼容处理 、 图片渲染为合适尺寸
     * @param img
     * @return {Promise<canvas>}
     */
    static renderFileChangedImg(img) {
        return new Promise(function (resolve) {
            Handlers.detectImageAutomaticRotation().then(res=>{
                // res 为 true 则浏览器对图片进行了回正，canvas操作的是纠正后的图片
                // 这里 android没进行旋转修复，是因为foodie android的jsBridge返回的图片
                // 获取不到旋转信息，不执行getData的回调函数

                //如果后面有图片截取操作，配置中不要设置最大值，因为这里会继续一次缩小操作。下次截取 缩小后的图片 比  截取原图  模糊。
                // let maxWidth = Handlers.canvasWidthAtFullscreen();
                if(res || BrowserChecker.isAndroid()){
                    // 图片缩放代码
                    // Handlers.fixedImgOAS(img,{
                    //     maxWidth
                    // }).then((canvas)=>{
                    //     resolve(canvas)
                    // })
                    // 图片未缩放的代码
                    resolve(img.src)
                }else{
                    EXIF.getData(img, () => {
                        var allMetaData = EXIF.getAllTags(img);
                        var orientation = allMetaData.Orientation;
                        // 图片缩放代码
                        // Handlers.fixedImgOAS(img, {
                        //     maxWidth,
                        //     orientation
                        // }).then((canvas)=>{
                        //     resolve(canvas)
                        // })
                        // 图片未缩放的代码
                        Handlers.fixedImgOAS(img, {
                            orientation: orientation
                        }).then((canvas)=>{
                            // canvas.toBlob((blob) => {
                            //   resolve(URL.createObjectURL(blob))
                              resolve(canvas.toDataURL('image/jpeg'))
                            // });
                        })
                    })
                }
            })
        })
    }

    /**
     * @param _config   保存参数的的option
     * @return {Promise<any>}
     */
    static save(_config) {
        return new Promise((resolve, reject) => {
            try {
                const param = new SaveShareParam(_config)
                Bridge.save(param, () => {
                    resolve()
                })
            } catch (err) {
                reject('save err:', err)
            }
        })

    }

    /**
     *
     * @param _config   分享参数的的option
     * @return {Promise<any>}
     */
    static share(_config) {
        return new Promise((resolve, reject) => {
            try {
                const param = new SaveShareParam(_config);
                Bridge.shareWithCallback(param, (res) => {
                    resolve(res)
                })
            } catch (err) {
                reject('shareWithCallback err:', err)
            }
        })
    }

    /**
     * 原名：fixedImageOritationAndSize
     * @param image   已加载的图片原生节点
     * @param options  配置 可选参数 width，height，maxWidth，maxHeight，oritation
     * @return {Promise<canvas>}
     */
    static fixedImgOAS(image,options){
        return new Promise(resolve => {
            options = options || {};
            // 通过options 中的width，height，maxWidth，maxHeight 获取最终的width，height 值
            let imgWidth = image.naturalWidth, imgHeight = image.naturalHeight,
                width = options.width, height = options.height,
                maxWidth = options.maxWidth, maxHeight = options.maxHeight;
            if (width && !height) {
                height = (imgHeight * width / imgWidth) << 0;
            } else if (height && !width) {
                width = (imgWidth * height / imgHeight) << 0;
            } else {
                width = imgWidth;
                height = imgHeight;
            }
            if (maxWidth && width > maxWidth) {
                width = maxWidth;
                height = (imgHeight * width / imgWidth) << 0;
            }

            if (maxHeight && height > maxHeight) {
                height = maxHeight;
                width = (imgWidth * height / imgHeight) << 0;
            }

            var opt = {};
            for (var k in options) opt[k] = options[k];
            opt.width = width;
            opt.height = height;
            let canvas = document.createElement('canvas');
            let ctx = canvas.getContext('2d');
            ctx.save();
            // 设置canvas 的尺寸并旋转偏移canvas
            transformCoordinate(canvas, ctx, width, height, options.orientation);
            ctx.drawImage(image,0,0,imgWidth,imgHeight,0,0,width,height);
            ctx.restore();
            resolve(canvas);
        })
    }

    /**
     * @param Node 页面节点
     */
    static showHideNodeImg(Node) {
        let imgs = Node.find('img');
        let imgsLength = imgs.length
        let srcRes = '';
        let index = 0;
        let firstLazyImg = imgs.eq(index);
        while (!firstLazyImg.data('src') && index<imgsLength - 1) {
            index++;
            firstLazyImg = imgs.eq(index)
        }

        if (!firstLazyImg.attr('src')) {
            $.each(imgs, function () {
                srcRes = $(this).data('src');

                if(srcRes && srcRes.endsWith('g')){
                    srcRes = srcRes.slice(0,-1);
                    $(this).attr('src', require(`../../assets/img/${srcRes}g`));
                }else if(srcRes && srcRes.endsWith('f')){
                    srcRes = srcRes.slice(0,-1);
                    $(this).attr('src', require(`../../assets/img/${srcRes}f`));
                }else if(srcRes && srcRes.endsWith('p')){
                    srcRes = srcRes.slice(0,-1);
                    $(this).attr('src', require(`../../assets/img/${srcRes}p`));
                }
            })
        }else{

        }
    }

    /**
     * @param actPage  页面节点
     * @return {Promise<any>}
     */
    static initPage(actPage) {
        return new Promise((resolve) => {
            $('.page').css('opacity', 0).hide();
            actPage.show();
            // 加载当前页面
            Handlers.showHideNodeImg(actPage);
            setTimeout(() => {
                actPage.css('opacity', 1).css('willChange', 'auto');
                resolve()
            }, 100)
        })
    }

    /**
     * 判断某个节点是否已绑定指定类型事件，避免函数内绑定事件重复解绑添加事件
     * @param Node    节点
     * @param Type    事件类型
     * @return {Promise<Boolean>}
     */
    static isHasEvent(Node,Type){
        // return new Promise((resolve) => {
            // havedEvent ,在节点上添加事件绑定的标记
            let havedEvent = Node.attr('havedEvents');

            if(havedEvent){
                if(havedEvent.includes(Type)){
                    // 已绑定指定事件
                    return true;
                }else{
                    return false
                }
            }else{
                return false
            }
        // })
    }

    /**
     * 给节点添加事件类型标记
     * @param Node     节点
     * @param Type     事件类型
     */
    static addEvent(Node,Type){
        let havedEvent = Node.attr('havedEvents');
        if(havedEvent && havedEvent.includes(Type)){
            throw new Error(`重复标记了${Type}事件类型`);
        }
        if(havedEvent && !havedEvent.includes(Type)){
            Node.attr('havedEvents',`${havedEvent} ${Type}`)
        }else{
            Node.attr('havedEvents',Type)
        }
    }
    /**
     * 原理是：原图的是一张 1 * 2 ，oritation为6的图片（逆时针旋转90deg）的图片，
     *      ios高 获取的图片尺寸 width为2，height为1，
     *      ios低和android获取的图片尺寸 width为1，height为2，实现代码如下
     * 用一张特殊的图片来检测当前浏览器是否对带 EXIF 信息的图片进行回正
     * */
    static detectImageAutomaticRotation() {
        const testAutoOrientationImageURL =
            'data:image/jpeg;base64,/9j/4QAiRXhpZgAATU0AKgAAAAgAAQESAAMAAAABAAYAAAA' +
            'AAAD/2wCEAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBA' +
            'QEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQE' +
            'BAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAf/AABEIAAEAAgMBEQACEQEDEQH/x' +
            'ABKAAEAAAAAAAAAAAAAAAAAAAALEAEAAAAAAAAAAAAAAAAAAAAAAQEAAAAAAAAAAAAAAAA' +
            'AAAAAEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8H//2Q==';
        let isImageAutomaticRotation;
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                // 如果图片变成 1x2，说明浏览器对图片进行了回正
                isImageAutomaticRotation = img.width === 1 && img.height === 2;
                resolve(isImageAutomaticRotation);
            };
            img.src = testAutoOrientationImageURL;
        });
    }

    /**
     * 返回的结果是: canvas在设备下全屏显示的分辨率尺寸
     * @return {number}
     */
    static canvasWidthAtFullscreen(){
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
        setTimeout(()=>{
            canvas = null;
            ctx = null;
        })
        return document.body.clientWidth * scale;
    }

    /**
     * 判断大小屏，用于适配
     * @return {boolean}
     */
    static bigScreen() {
        // window.screen.height 为屏幕高度
        // window.screen.availHeight 为浏览器 可用高度
        let result = false;
        const rate = window.screen.height / window.screen.width;
        let limit =  window.screen.height === window.screen.availHeight ? 1.8 : 1.65; // 临界判断值
        if (rate > limit) {
            result = true;
        }
        // console.log('是全面屏js：'+result)
        return result;
    }

    /**
     * 判断当前设备是否联网
     * @return {boolean}
     */
    static isOffLine(){
       return !window.navigator.onLine
    }
}

/**
 * 对比两个版本号
 * a 对比版本
 * b 当前版本
 * b >= a ===> true
 * b < a ===> false
 * */
function compareVersion(a, b) {
    for (let i in b) {
        let cur = parseInt(b[i], 10) || 0
        let limit = parseInt(a[i], 10) || 0
        if (cur > limit) {
            return true
        } else if (cur < limit) {
            return false
        }
    }
    return true
}


// 当有状态改变  修改基本信息
/**
 * 合并对象
 * @param obj
 */
function assignMyApp(obj) {
    Handlers.myApp = Object.assign({}, Handlers.myApp, obj)
}

/**
 * Transform canvas coordination according to specified frame size and orientation   根据指定的帧大小和方向变换画布
 * Orientation value is from EXIF tag
 */
/**
 * 旋转 canvas
 * @param canvas
 * @param ctx
 * @param width
 * @param height
 * @param orientation
 */
function transformCoordinate(canvas, ctx, width, height, orientation) {
    switch (orientation) {
        case 5:
        case 6:
        case 7:
        case 8:
            canvas.width = height;
            canvas.height = width;
            break;
        default:
            canvas.width = width;
            canvas.height = height;
    }
    switch (orientation) {
        case 2:
            // horizontal flip
            ctx.translate(width, 0);
            ctx.scale(-1, 1);
            break;
        case 3:
            // 180 rotate left
            ctx.translate(width, height);
            ctx.rotate(Math.PI);
            break;
        case 4:
            // vertical flip
            ctx.translate(0, height);
            ctx.scale(1, -1);
            break;
        case 5:
            // vertical flip + 90 rotate right
            ctx.rotate(0.5 * Math.PI);
            ctx.scale(1, -1);
            break;
        case 6:
            // 90 rotate right
            ctx.rotate(0.5 * Math.PI);
            ctx.translate(0, -height);
            break;
        case 7:
            // horizontal flip + 90 rotate right
            ctx.rotate(0.5 * Math.PI);
            ctx.translate(width, -height);
            ctx.scale(-1, 1);
            break;
        case 8:
            // 90 rotate left
            ctx.rotate(-0.5 * Math.PI);
            ctx.translate(-width, 0);
            break;
        default:
            break;
    }
}
