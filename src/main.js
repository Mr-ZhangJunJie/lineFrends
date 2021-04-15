import '@/static/css/main.scss'
import 'zepto/src/zepto'
import 'zepto/src/event'
import 'zepto/src/ajax'
import 'zepto/src/fx'
import loading from '@/bag/vueCommon/loading/1/loading.js'
import errMsg from '@/bag/vueCommon/errMsg/1/e'
import {showToast} from '@/bag/vueCommon/toast/1/t.js'
import Handlers from '@/static/js/handlers'
import imgSupport from '@/bag/util/imgSupport'
import {setHat, destroyHat} from '@/bag/plugins/hat'
import BrowserChecker from '@/bag/util/BrowserChecker'
import './static/js/lut-filter'
import scrawlData from './data.js'


window.loading = loading;
window.errMsg = errMsg;

let clickStatus = false;
let currentTem = 'tem1'; // 默认画第1个图
let oldTempNum = '';
let uploadFlag = false;    // 上传的开关
let orignCuteCanvas = null;  // 生成原始cut后的图
let FilterContro = null;  // 滤镜控制对象
let nullImag = null;

let timer1; // 延长loading

let FR3 = null,YU3 = null,SS1 = null,IN1 = null,IN7 = null,PO3 = null; // 滤镜

let easyLink = 'https://lnk0.com/easylink/ELBpoAFp';
let isSupportWebGL = true;

_hmt.push(['_trackEvent', Handlers.myApp.EventFullPath, 'init', '受访pv-总量']);

Handlers.checkAppInfo().then(() => {
    $('.saveInApp').css('display', 'block');
    $('.saveOutApp').css('display', 'none');
    _hmt.push(['_trackEvent', Handlers.myApp.EventFullPath, 'init', '受访pv'])
});

// offline网络连接事件
window.addEventListener("offline",function() {
    errMsg({text: '请检查网络连接'})
});
enterP1();
async function enterP1() {
    await Handlers.initPage($('#p1'));
    loading({state: 0});

    let $startBtn = $('.startBtn');
    if (!Handlers.isHasEvent($startBtn, 'click')) {
        Handlers.addEvent($startBtn, 'click')
        $startBtn.on('click', function () {
            if(Handlers.isOffLine()){return errMsg({text: '请检查网络连接'})};
            _hmt.push(['_trackEvent', Handlers.myApp.EventFullPath, 'click', '首页开始']);
            console.log(!Handlers.myApp.isInApp,process.env.VUE_APP_ENV !== 'development')
            if(!Handlers.myApp.isInApp && process.env.VUE_APP_ENV !== 'development'){
                return window.location.href = easyLink;
            }
            $.fx.speeds = 0;
            enterP2()
        });
    }
    // 小卡通人物动画
    setTimeout(function () {
        animated($('.cartoon1'));
        function animated($dom){
            $dom.animate({
                transform: 'translateY(-3px)'
            },'400','linear',()=>{
                $dom.animate({
                    transform: 'translateY(3px)'
                },'800','linear',()=>{
                    $dom.animate({
                        transform: 'translateY(0px)'
                    },'400','linear',()=>{
                        let nextSibling = $dom.next('.cartoon');

                        if(nextSibling.length>0){
                            animated(nextSibling)
                        }else{
                            animated($('.cartoon1'));
                        }
                    });
                });
            });
        }

    },1000);


    setTimeout(function () {
        // $('.preLoad') 页面结构的第三部分
        Handlers.showHideNodeImg($('.preLoad'))
    }, 600);

}

async function enterP2() {
    await Handlers.initPage($('#p2'));
    let $dragImg = $('.dragImg'), dragImg = $dragImg[0],$selectArea = $('.selectArea'),$dragArea = $('.dragArea'),
        $dragTip = $('.dragTip');
    let $reUpBtn = $('.reUpBtn'),$upBtn = $('.upBtn');
    dragImg.src = '';
    $dragArea.css('opacity', 0);
    $dragTip.css('display', 'block');
    uploadFlag = false;

    function upload() {
        let pushData = this.target.id == 'selectArea' ? "选择" : "重选";
        _hmt.push(["_trackEvent", Handlers.myApp.EventFullPath, "click", pushData]);

        Handlers.pickImg()
            .then(async src => {
                // canvas 旋转和重置canvas尺寸
                if (!!src === false) {
                    return loading({state: 0})
                } else if (src.errMsg) {
                    return errMsg({text: src.errMsg})
                }
                // 点击上传按钮，可以上传图片了
                uploadFlag = true;

                dragImg.src = src;
                dragImg.onload = async function () {
                    $dragTip.css('display', 'none');
                    src = '';
                    Handlers.ezGesture($selectArea, $dragImg);
                    loading({state: 0})
                }
            })
    }

    if (!Handlers.isHasEvent($reUpBtn, 'click')) {
        Handlers.addEvent($reUpBtn, 'click');
        $reUpBtn.on('click', function (e){
            upload.call(e)
        })
    }
    $selectArea.off('click').on('click', function (e) {
        upload.call(e);
    });

    // 上传
    if (!Handlers.isHasEvent($upBtn, 'click')) {
        Handlers.addEvent($upBtn, 'click');
        $upBtn.on('click', () => {
            if(Handlers.isOffLine()){return errMsg({text: '请检查网络连接'})};
            if (!uploadFlag) return;
            loading({state: 1, text: '加载中。。。'});
            imgSupport.cutAutoImage($dragImg, $dragArea).then(cutCanvas => {
                _hmt.push(['_trackEvent', Handlers.myApp.EventFullPath, 'click', '确认提交']);
                orignCuteCanvas = cutCanvas;
                Handlers.unbindEventsEzGesture();
                enterP3()
            }).catch(() => {
                loading({state: 0});
                errMsg({text: '请求超时，请重试'})
            })
        })
    }
}

function enterP3() {
    let uPCanvas = $('.uPCanvas')[0],uCtx = uPCanvas.getContext('2d'),designWidth = 700, designHeight = 700,actStickerIndex = 9; //初始 sticker的z-index
    let backingStore = uCtx.backingStorePixelRatio ||
        uCtx.webkitBackingStorePixelRatio ||
        uCtx.mozBackingStorePixelRatio ||
        uCtx.msBackingStorePixelRatio ||
        uCtx.oBackingStorePixelRatio ||
        uCtx.backingStorePixelRatio || 1;

    let ratio = (window.devicePixelRatio || 1) / backingStore;
    let scale = ratio > 2 ? ratio : 2;

    uPCanvas.width = document.body.clientWidth * scale;
    uPCanvas.height = ~~(uPCanvas.width * designHeight / designWidth);
    let deSignscale = uPCanvas.width / designWidth;
    uCtx.scale(deSignscale,deSignscale);

    FR3 = $('.FR3')[0],IN1 = $('.IN1')[0],IN7 = $('.IN7')[0],SS1 = $('.SS1')[0],PO3 = $('.PO3')[0],YU3 = $('.YU3')[0];

    let $modsWprSpan = $('.modsWpr span'); // 模版按钮
    let $mods = $('.mods'),$filtersBox = $('.filtersBox'),$shareImgBox = $('.shareImgBox'),$p4_back = $('.p4_back');

    function resetData() {
        clickStatus = false;
        currentTem = 'tem1'; // 默认画第1个图
        oldTempNum = '';
    }

    resetData();

    /**
     * 加载第一个模版按钮的滤镜图
     * */
    function tabFirstTem() {
        // 生成滤镜控制对象
        let canvas1 = document.createElement('canvas');
        isSupportWebGL = canvas1.getContext('webgl')||canvas1.getContext('experimental-webgl');
        // 如果不支持webgl跳过
        if(!isSupportWebGL){return Promise.resolve(true)}

        FilterContro = new LutFilter({
            el: $('#filterCanvas')[0],
            'oSrc': orignCuteCanvas,
            'fSrc': IN1,
            width: orignCuteCanvas.width,
            height: orignCuteCanvas.height
        });
        // 绘制纹理
        return FilterContro.loadTextureImg()
    }

    /**
     * 切换到tag下的第一个模版并且加载页面
     * */
    tabFirstTem().then(async ()=>{
        $modsWprSpan.eq(0).trigger('click');
        await Handlers.initPage($('#p3'));
        loading({state: 0});
        /**
         * 模版盒子滚动到最左端
         * */
        $mods.scrollLeft(0);
    }).catch(()=>{
        errMsg("纹理加载数据失败");
    });


    /**
     * 生成模版绘制结果的url
     * */
    function drawImg(filterCanvas,data) {
        const {borderImg,filPos} = data;
        uCtx.clearRect(0, 0, uPCanvas.width, uPCanvas.height);
        uCtx.drawImage(filterCanvas, 0, 0, filterCanvas.width, filterCanvas.height, filPos.left, filPos.top, filPos.width, filPos.height);
        uCtx.drawImage(nullImag, 0, 0, nullImag.naturalWidth, nullImag.naturalHeight, borderImg.left, borderImg.top, borderImg.width, borderImg.height);
        clearTimeout(timer1);
        loading({state: 0})
    }

    /**
     * 切换模版操作
     * */
    function changeTem(_this,data) {
        // 如果存在滤镜图，获取封面图进行绘制
        // 如果不存在，则先绘制滤镜图再绘制
        $modsWprSpan.removeClass('thumbActive');
        _this.addClass('thumbActive');
        _hmt.push(['_trackEvent', Handlers.myApp.EventFullPath, 'click', '点击模版总量']);
        _hmt.push(['_trackEvent', Handlers.myApp.EventFullPath, 'click', '点击模版' + currentTem]);
        timer1 = setTimeout(function () {
            loading({state: 1, text: '加载中'})
        }, 400);
        if(!isSupportWebGL){return drawImg(orignCuteCanvas,data);}
        let filterid = _this.data("filterid");
        let mikoTarget = filterid === 'IN1' ? IN1 : filterid === 'IN7' ? IN7 : filterid === 'FR3' ? FR3 : filterid === 'SS1' ? SS1 :
            filterid === 'PO3' ? PO3 : filterid === 'YU3' ? YU3 : null ;

        FilterContro.changeFilter(mikoTarget).then(() => {
            drawImg(FilterContro.exportCanvas(),data);
        });
    }

    /**
     * 模版缩略图Dom绑定事件
     * */

    if(!Handlers.isHasEvent($modsWprSpan,'click')){
        Handlers.addEvent($modsWprSpan, 'click');
        $modsWprSpan.on('click', function (e) {
            // 加载 模版图，加载 色块，加载完成后执行绘制

            e.stopPropagation();
            // 重复点击不做任何处理
            let _this = $(this);

            currentTem = _this.data("tem");
            if (oldTempNum === currentTem) return loading({state: 0});

            oldTempNum = currentTem;
            // 获取对应的边框
            nullImag = document.querySelector(`.cover${currentTem.slice(-1)}`);
            // 通过模版标记获取对应的图片封面

            // 创建边框及相应涂鸦
            createTemItem(scrawlData[currentTem],_this);

            changeTem(_this,scrawlData[currentTem]);
        });
    }


    /**
     * 创建模版元素
    * */
    function createTemItem(data,modsWprSpan) {
        let targetFilterBox = $filtersBox.eq(modsWprSpan.index());
        $filtersBox.removeClass('filtersActive');
        targetFilterBox.addClass('filtersActive');
        if(!targetFilterBox.attr('havedRender')){
            if(data.scrawls){
                for(let i=0,len = data.scrawls.length; i< len;i++){
                    createScrawl(data.scrawls[i],targetFilterBox)
                }
            }
            targetFilterBox.attr('havedRender',true)
        }
    }

    /**
     * 取消涂鸦选中状态
     * */
    if(!Handlers.isHasEvent($filtersBox,'click')) {
        Handlers.addEvent($filtersBox, 'click');
        $filtersBox.on('click',function () {
            destroyHat();
            $filtersBox.find('.filter').attr('active', '0');
        });
    }


    /**
     * 创建涂鸦
     */
    function createScrawl(scrawlData,targetFilterBox) {
        let rootFontSize = parseFloat(document.documentElement.style.fontSize);
        let filterTemplate = $(`<div class="filter"></div>`, {
            css: {
                width: `${scrawlData['width']}rem`,
                height: `${scrawlData['height']}rem`,
                left: `${scrawlData['left'] * rootFontSize}px`,
                top: `${scrawlData['top'] * rootFontSize}px`,
                zIndex: `${scrawlData['zIndex']}`
            }
        });
        if(!Handlers.isHasEvent(filterTemplate,'click')) {
            Handlers.addEvent(filterTemplate, 'click');
            filterTemplate.on('click', function (e) {
                if ($(this).attr('active') == '0' || $(this).attr('active') == undefined) {
                    targetFilterBox.find('.filter').attr('active', '0');

                    actStickerIndex++;
                    $(this).attr('zindex', actStickerIndex);
                    $(this).css('zIndex', actStickerIndex);
                    $(this).attr('active', '1');
                    setHat($(this), function () {}, function () {})
                }
                e.stopPropagation();
                e.preventDefault();
            });
        }

        let imgSrc = require(`./assets/img/${scrawlData['src']}`);
        filterTemplate.append($(`<img src=${imgSrc} class="hat-icon" alt="">`));
        targetFilterBox.append(filterTemplate);
    }


    /**
     * 站外保存图片
     * */
    let $saveOutApp = $('#p3 .saveOutApp');
    if(! Handlers.isHasEvent($saveOutApp,'click')){
        Handlers.addEvent($saveOutApp,'click');
        $saveOutApp.on('click', async function () {
            if (clickStatus) {
                return false
            }
            clickStatus = true;
            _hmt.push(['_trackEvent', Handlers.myApp.EventFullPath, 'click', '保存图片']);
            let saveCanvas = await compoundSaveImg();
            let saveImgSrc = saveCanvas.toDataURL('image/jpeg');
            $shareImgBox.css('display', 'flex').find('img').attr('src', saveImgSrc);
            clickStatus = false;
        });
    }



    /**
     *  取消站外保存图片提示框
     * */
    if(! Handlers.isHasEvent($shareImgBox,'click')){
        Handlers.addEvent($shareImgBox,'click');
        $shareImgBox.on('click', function (evt) {
            if ($(evt.target).hasClass('shareImgBox')) {
                $shareImgBox.css('display', 'none')
            }
        });
    }

    /**
     * 合成保存图
     * */
    async function compoundSaveImg() {
        let canvas = document.createElement('canvas');
        canvas.width = uPCanvas.width;
        canvas.height = uPCanvas.height;
        let ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // 绘制生成的内容
        ctx.drawImage(uPCanvas,0,0);
        // 绘制filters
        let filters = $('.filtersActive .filter');
        if (filters.length > 0) {
            await drawStickers(ctx, filters)
        }
        return canvas;
    }

    /**
     * 绘制涂鸦
     * */
    function drawStickers(ctx, filters) {
        // 相应元素的width和position
        let $filtersActive = $('.filtersActive');
        let scale1 = uPCanvas.width / $filtersActive.width();

        return new Promise((resolve) => {
            let _$stickers = filters.sort((a, b) => {
                return a.getAttribute('zindex') - b.getAttribute('zindex')
            });
            _$stickers.each((index, hatStamp) => {
                let $hatStamp = $(hatStamp);
                var hatStampTransform = $hatStamp.css("-webkit-transform");
                $hatStamp.css("transform", "");
                $hatStamp.css("-webkit-transform", "");
                var $hatStampImg = $hatStamp.find("img");
                var hatStampOffset = $hatStampImg.offset();
                $hatStamp.css("transform", hatStampTransform);
                $hatStamp.css("-webkit-transform", hatStampTransform);
                var hatLayerOffset = $filtersActive.offset();

                var hatStampFrame = {
                    x: (hatStampOffset.left - hatLayerOffset.left),
                    y: (hatStampOffset.top - hatLayerOffset.top),
                    width: hatStampOffset.width,
                    height: hatStampOffset.height,
                    rotation: parseFloat($hatStamp.attr("rotation")),
                    scale: parseFloat($hatStamp.attr("scale"))
                };
                ctx.save();
                ctx.scale(scale1,scale1);
                ctx.translate(hatStampFrame.x + hatStampFrame.width / 2, hatStampFrame.y + hatStampFrame.height / 2);
                ctx.rotate(hatStampFrame.rotation);
                if ($hatStamp.attr('reverse') === '1') {
                    ctx.scale(-hatStampFrame.scale, hatStampFrame.scale);
                } else {
                    ctx.scale(hatStampFrame.scale, hatStampFrame.scale);
                }
                ctx.drawImage($hatStampImg[0], -hatStampFrame.width / 2, -hatStampFrame.height / 2, hatStampFrame.width, hatStampFrame.height);
                ctx.restore();
                if (index === _$stickers.length - 1) {
                    resolve()
                }
            });

        })
    }

    /**
     * 站内保存并分享图片
     * */
    let $saveInApp = $('.saveInApp');
    if(! Handlers.isHasEvent($saveInApp,'click')){
        Handlers.addEvent($saveInApp,'click');
        $saveInApp.on('click', async function () {
            if (clickStatus) {
                return false
            }
            clickStatus = true;
            _hmt.push(['_trackEvent', Handlers.myApp.EventFullPath, 'click', `保存并分享总量`]);
            _hmt.push(['_trackEvent', Handlers.myApp.EventFullPath, 'click', `保存并分享-${currentTem}`]);
            let saveCanvas = await compoundSaveImg();
            let saveImgSrc = saveCanvas.toDataURL('image/jpeg');
            if (BrowserChecker.isIos()) {
                clickStatus = false;
            }
            Handlers.save({url: saveImgSrc, type: 'image'}).then(() => {
                showToast();
                Handlers.share({url: saveImgSrc, type: 'image'}).then(() => {
                    clickStatus = false;
                });
            });

        });
    }


    /**
     * 返回
     * */
    function goUpladPage() {
        _hmt.push(["_trackEvent", Handlers.myApp.EventFullPath, "click", "返回"]);
        $filtersBox.empty().removeAttr('havedrender');

        resetData();
        uCtx.clearRect(0, 0, uPCanvas.width, uPCanvas.height);
        enterP2();
    }


    if(! Handlers.isHasEvent($p4_back,'click')){
        Handlers.addEvent($p4_back,'click');
        $p4_back.on('click', function () {
            goUpladPage()
        });
    }

}
