import axios from 'axios';
import sha1 from 'js-sha1';

function Share(opt) {
    this.opt = opt;
    this.wxInfo = {
        timestamp: '',
        noncestr: '',
        appid: this.opt.appid,
        jsapi_ticket: '',
        signature: ''
    };
    this.wbInfo = {
        timestamp: '',
        noncestr: '',
        appid: this.opt.appid,
        jsapi_ticket: '',
        signature: ''
    };
    return this;
}

Share.prototype.start = function () {
    var isWx = /micromessenger/.test(navigator.userAgent.toLowerCase());
    var isWb = /weibo/.test(navigator.userAgent.toLowerCase());
    if (isWx) {
        this.initApiTicket(this.opt.wx_url_ticket, true);
    }
    if (isWb) {
        this.initApiTicket(this.opt.wb_url_ticket, false);
    }
    return this;
}

Share.prototype.getNoncestr = function () {
    var arr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
        'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
        '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    var tmpStr = '';
    const max = arr.length - 1;
    for (let i = 0; i < 16; i++) {
        let key = Math.floor(Math.random() * max);
        tmpStr += arr[key];
    }
    return tmpStr;
}


Share.prototype.getTimeStamp = function () {
    var time = Date.parse(new Date()) / 1000;
    return time;
}

Share.prototype.getSignature = function (jsapi_ticket, noncestr, timestamp, url_current) {
    var signature = "jsapi_ticket=" + jsapi_ticket
        + "&noncestr=" + noncestr
        + "&timestamp=" + timestamp
        + "&url=" + url_current;

    return sha1(signature);
}

Share.prototype.initApiTicket = function (url, isWx) {
    var self = this;
    if (isWx) {
        axios.post(url)
            .then((req) => {
                return req.data.data;
            })
            .then((data) => {
                var jsapi_ticket = data.jsapi_ticket;
                self.wxInfo.jsapi_ticket = jsapi_ticket;
                self.initWeiXinInfo(self.wxInfo.jsapi_ticket);
                self.configWeiXin();
            })
            .catch((err) => {
            });
    } else {
        axios.post(url, JSON.stringify({"item_type": self.opt.projectName}))
            .then((req) => {
                return req.data.data;
            })
            .then((data) => {
                var jsapi_ticket = data.jsapi_ticket;
                self.wbInfo.jsapi_ticket = jsapi_ticket;
                self.initWeiBoInfo(self.wbInfo.jsapi_ticket);
                self.configWeiBo();
            })
            .catch((err) => {
            });
    }
}

Share.prototype.initWeiBoInfo = function (jsapi_ticket) {
    //初始化所有数据
    this.wbInfo.appid = this.opt.wbAppId;
    this.wbInfo.noncestr = this.getNoncestr();
    this.wbInfo.timestamp = this.getTimeStamp();
    this.wbInfo.signature = this.getSignature(jsapi_ticket, this.wbInfo.noncestr, this.wbInfo.timestamp, this.opt.location_url);
}

Share.prototype.initWeiXinInfo = function (jsapi_ticket) {
    //初始化所有数据
    this.wxInfo.appid = this.opt.wxAppId;
    this.wxInfo.noncestr = this.getNoncestr();
    this.wxInfo.timestamp = this.getTimeStamp();
    this.wxInfo.signature = this.getSignature(jsapi_ticket, this.wxInfo.noncestr, this.wxInfo.timestamp, this.opt.location_url);
}

Share.prototype.configWeiBo = function () {
    //wb分享配置
    var self = this;
    window.WeiboJS.init({
        'appkey': self.wbInfo.appid,
        // 'debug': true,
        'timestamp': self.wbInfo.timestamp,
        'noncestr': self.wbInfo.noncestr,
        'signature': self.wbInfo.signature,
        'scope': [
            'getNetworkType',
            'networkTypeChanged',
            'getBrowserInfo',
            'checkAvailability',
            'setBrowserTitle',
            'openMenu',
            'setMenuItems',
            'menuItemSelected',
            'setSharingContent',
            'openImage',
            'scanQRCode',
            'pickImage',
            'getLocation',
            'pickContact',
            'apiFromTheFuture'
        ]
    }, function (ret) {

        WeiboJS.invoke("setSharingContent",
            {
                "icon": self.opt.pic,
                "title": self.opt.summary,
                "desc": self.opt.title
            },
            function (params) {
                //safeAlert("setMenuItems 返回数据：" + JSON.stringify(params));
            });
        //history.pushState({}, "国庆节快乐", self.opt.target_url);
    });
}

Share.prototype.configWeiXin = function () {
    //wx分享配置
    var self = this;
    wx.config({
        // debug: true, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
        appId: self.wxInfo.appid, // 必填，公众号的唯一标识
        timestamp: self.wxInfo.timestamp, // 必填，生成签名的时间戳
        nonceStr: self.wxInfo.noncestr, // 必填，生成签名的随机串
        signature: self.wxInfo.signature,// 必填，签名，见附录1
        jsApiList: ["onMenuShareTimeline", "onMenuShareAppMessage", "onMenuShareQQ", "onMenuShareQZone"] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
    });

    wx.ready(function () {
        // config信息验证后会执行ready方法，所有接口调用都必须在config接口获得结果之后，config是一个客户端的异步操作，所以如果需要在页面加载时就调用相关接口，则须把相关接口放在ready函数中调用来确保正确执行。对于用户触发时才调用的接口，则可以直接调用，不需要放在ready函数中。
        wx.onMenuShareTimeline({
            title: self.opt.title, // 分享标题
            link: self.opt.target_url, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
            imgUrl: self.opt.pic, // 分享图标
            success: function () {
                // 用户确认分享后执行的回调函数
                if (typeof(faceuDataReport) !== 'undefined') {
                    var send_str = "click_share_wx_to_timeline";
                    faceuDataReport.keyInfoReport(send_str, '');
                }
            },
            cancel: function () {
                // 用户取消分享后执行的回调函数
            }
        });

        wx.onMenuShareAppMessage({
            title: self.opt.title, // 分享标题
            desc: self.opt.summary, // 分享描述
            link: self.opt.target_url, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
            imgUrl: self.opt.pic, // 分享图标
            type: '', // 分享类型,music、video或link，不填默认为link
            dataUrl: '', // 如果type是music或video，则要提供数据链接，默认为空
            success: function () {
                // 用户确认分享后执行的回调函数
                if (typeof(faceuDataReport) !== 'undefined') {
                    var send_str = "click_share_wx_to_weChat";
                    faceuDataReport.keyInfoReport(send_str, '');
                }
            },
            cancel: function () {
                // 用户取消分享后执行的回调函数
            }
        });

        wx.onMenuShareQQ({
            title: self.opt.title, // 分享标题
            desc: self.opt.summary, // 分享描述
            link: self.opt.target_url, // 分享链接
            imgUrl: self.opt.pic, // 分享图标
            success: function () {
                // 用户确认分享后执行的回调函数
                if (typeof(faceuDataReport) !== 'undefined') {
                    let send_str = "click_share_wx_to_qq";
                    faceuDataReport.keyInfoReport(send_str, '');
                }
            },
            cancel: function () {
                // 用户取消分享后执行的回调函数
            }
        });

        wx.onMenuShareQZone({
            title: self.opt.title, // 分享标题
            desc: self.opt.summary, // 分享描述
            link: self.opt.target_url, // 分享链接
            imgUrl: self.opt.pic, // 分享图标
            success: function () {
                // 用户确认分享后执行的回调函数
                if (typeof(faceuDataReport) !== 'undefined') {
                    let send_str = "click_share_wx_to_Qzone";
                    faceuDataReport.keyInfoReport(send_str, '');
                }
            },
            cancel: function () {
                // 用户取消分享后执行的回调函数
            }
        });
    });
}
export default Share;



// WEBPACK FOOTER //
// ./src/common/share/share.js
