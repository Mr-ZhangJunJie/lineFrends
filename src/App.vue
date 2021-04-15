<template>
  <div id="p1">
    <div class="wpr">
      <div class="menu">
        <img :src="require('@/static/img/logo.png')" class="logo" alt="">
        <img :src="require('@/static/img/close.png')" class="close" @click="closePage" alt="">
      </div>
      <div class="gallery">
        <ul ref="ul1">
          <li v-if="gallery.length > 0" v-for="(item, index) in gallery" :style="{'z-index': index}">
            <img :src="config.imagePrefix + item.url" width="100%" alt="">
          </li>
        </ul>
      </div>
      <var class="txt">你喜欢的穿搭风格是什么？告诉我们吧~</var>
      <div class="bot">
        <span class="unlike" @click="likeFn('left')"><img :src="require('@/static/img/ic_dislike.png')" alt=""></span>
        <span class="like" @click="likeFn('right')"><img :src="require('@/static/img/ic_like.png')" alt=""></span>
      </div>
    </div>
    <div class="mask dataDone" :style="{display: dataNone?'flex':''}">
      <div class="dataDoneWpr">
        <img :src="require('@/static/img/mask_pic.jpg')" alt="">
        <p v-if="dataDone">感谢！你已经完成了全部的调查</p>
        <p v-if="dataOver">当前没有调查，请稍后再来</p>
        <button class="btn" @click='closePage'>返回</button>
      </div>
    </div>

    <div class="closeRemind mask" :style="{display: closeRemindMask?'flex':''}">
      <div class="closeRemindWpr">
        <p>离开当前时尚调查？</p>
        <button class="btn left" @click='closeRemindMask = false'>取消</button>
        <button class="btn" @click='closePageEnd'>确定</button>
      </div>
    </div>
    <button @click='rereshData' style="display:-none;z-index:99999;right:0;padding:.2rem;top:1.8rem;border-radius: .12rem;font-size:.32rem;position:fixed;background-color:#67c23a;color:#fff;">initData</button>
  </div>
</template>

<script>
import Handlers from '@/static/js/zzHandlers'
import utils from '@/bag/util/index'
import * as requestSupport from '@/static/js/requestSupport'
import config from '@/config'
let _EventFullPath = Handlers.myApp.EventFullPath

export default {
  name: 'gallery',
  data(){
    return {
      config: null,
      gallery: [],
      endState: false,
      dataNone: false,
      dataDone: false,
      dataOver: false,
      closeRemindMask:false,
    }
  },
   mounted(){
     var vConsole = new VConsole();
    loading()
    this.initPage()
    // window.ZEPETO = {userInfo: {hashCode: 'asd'}}
    this.waitAppInfo().then(async res => {
      console.log(window.ZEPETO);
      window.ZEPETO.userAgent = window.ZEPETO.hasOwnProperty('userAgent') ? window.ZEPETO.userAgent : '-'
      window.ZEPETO.duid = window.ZEPETO.hasOwnProperty('duid') ? window.ZEPETO.duid : '-'
      console.log('waitAppInfo suc', window.ZEPETO);

      this.config = config

      let titleId = await this.fetchActData()
      requestSupport.dataReport()
      this.titleId = titleId
      let data = await this.fetchGetCardList(1)

      // 初始图片动作
      this.$nextTick(() => {
        this.activeDomInit()
        loading({state: 0})
      })
    })
  },
  methods: {
    waitAppInfo() {
      return new Promise((resolve, reject) => {

        // window.ZEPETO = {userInfo: {hashCode: 'asd'}}
        // resolve(1)
        // return

        if (window.hasOwnProperty("ZEPETO") == false) {
    			document.addEventListener("ZepetoLoaded", function() {
            resolve(1)
          })
    		} else {
          resolve(1)
    		}
      })
    },
    rereshData() {
      return requestSupport.getRefresh({titleId: this.titleId}).then(res => {
        console.log('getRefresh', res);
      })
    },
    closePage() {
      // window.location.href="ZEPETO://webframe/close"
      // this.dataNone = false
      this.closeRemindMask = true
    },
    closePageEnd() {
      window.location.href="ZEPETO://webview/close"
    },
    // 获取活动信息
    fetchActData() {
      return requestSupport.getActData().then(res => {
        return res.result.id
      }).catch(err => {
        console.log('fetchActData err');
      })
    },
    // 获取卡片列表
    fetchGetCardList(initState) {
      // return Promise.resolve(requestSupport.getCardList({}).then(res => {
      // })
      return new Promise((resolve, reject) => {
        requestSupport.getCardList({titleId: this.titleId}).then(res => {
          if(res.result.length > 0) {
            let arr = res.result
            if(!initState) {
              arr.splice(0, 3)
            }
            this.gallery.unshift(...arr)
            return resolve()
          } else {
            this.endState = true
            this.dataNone = true
            this.dataDone = true
            console.log('无数据状态');

            return reject('1')
          }
        })
      }).catch(err => {
        loading({state: 0})
      })
    },
    fetchOperate(item, state) {
      return requestSupport.getOperate({cardId: item.id, operateType: state, titleId: item.titleId, zzId: encodeURIComponent(window.ZEPETO.userInfo.hashCode),}).then(res => {
        console.log('fetchOperate suc');
      }).catch(err => {
        console.log('fetchOperate err');
      })
    },
    activeDomInit() {
      let imgs = $('ul li')
      let len = imgs.length
      imgs.eq(len - 1).addClass('active')
    },
    likeFn(direction) {
      direction == 'left' ? $('li.active').addClass('runAwayLeft') : $('li.active').addClass('runAwayRight')
      this.fetchOperate(this.gallery[this.gallery.length - 1], direction == 'left'? 1: 2)
      setTimeout(async () => {

        this.gallery.pop()
        if(!this.endState && this.gallery.length <= 3) {
          console.log('剩余不足拉取新图片');
          await this.fetchGetCardList(0)
        }
        if(this.endState && this.gallery.length == 0) {
          this.dataNone = true
          this.dataDone = true
        }

        this.$nextTick(() => {
          let arr = []
          this.gallery.forEach((item, index) => {
            arr.push(item.id)
          })
          console.log('this.gallery', this.gallery.length, arr);
          let imgs = $('ul li')
          let len = imgs.length
          imgs.eq(len - 1).addClass('active')
        })
      }, 320)
    },
    // 页面初始
    initPage() {
      $('#app').addClass('outApp').removeClass('inApp')
      Handlers.checkAppInfo(() => {
        _EventFullPath = Handlers.myApp.EventFullPath
        $('#app').removeClass('outApp').addClass('inApp')
        console.log('it is inApp now');
        utils.preventDoubleClick()//禁止ios内双击放大页面
      })
      $('#p1').css('opacity', 1)

      setTimeout(() => {
        // this.swiper.updateSize()
        // this.swiper.updateSlides()
        // this.swiper.slideTo(1, 200)
        _EventFullPath = Handlers.myApp.EventFullPath
        console.log(_EventFullPath);
        _hmt.push(['_trackEvent', _EventFullPath, 'pv', 'page1'])
      }, 2000)
    },
    // async checkResiduum(cb) {
    //   if(!this.endState && this.gallery.length <= 5) {
    //     console.log('剩余不足拉取新图片');
    //   }
    // }
  },
  // watch:{
  //   gallery(val) {
  //     console.log('watch gallery', val.length);
  //     this.checkResiduum()
  //   }
  // }
}
</script>

<style lang="scss">
#p1{
  background-color: #dee3e9;overflow-x: hidden;
}
.gallery{
  width:6.78rem;height:9.04rem;border-radius: .4rem;
  position: relative;
  li{
    position: absolute;background-color: #fff;
    width:6.78rem;height:9.04rem;line-height:9.04rem;overflow: hidden;border-radius: .4rem;
    box-shadow: 0 .28rem .36rem 0 rgba(4, 0, 0, 0);
    transition: all .3s;
    img{
      vertical-align: middle;
    }
  }
  li.active{
    box-shadow: 0 .28rem .36rem 0 rgba(4, 0, 0, .15);
  }
  li.runAwayLeft{
    animation: runAwayLeft .3s ease-out 0s;
    animation-fill-mode:forwards;
  }
  li.runAwayRight{
    animation: runAwayRight .3s ease-out 0s;
    animation-fill-mode:forwards;
  }
}
.menu{
  position: fixed;top:0;width:100%;height:.6rem;box-sizing: border-box;padding:0 .34rem;
  display: flex;justify-content: space-between;align-items: center;top:.2rem;
  .logo{
    width:2.32rem;
  }
  .close{
    width:.32rem;
  }
}
.bot{
  span{
    display: inline-block;width:1.28rem;height:1.28rem;text-align: center;line-height: 1.28rem;
    background-color: #fff;border-radius: 50%;
    &:nth-child(1){
      margin-right:1.1rem;
    }
  }
  img{
    width:.94rem;vertical-align: middle;

  }
}
.txt{
  margin:.69rem auto .32rem;
}
.btn{
  text-align: center;background-color: #33eea7;
  font-size: .3rem;color: #000;font-weight: bold;
  letter-spacing: .03rem;border-radius: 2rem;
  width:100%;line-height: 1.1rem;
}
.dataDoneWpr{
  background-color: #fff;
  width:6.8rem;text-align: center;
  font-size: .3rem;color:#000;box-sizing: border-box;
  padding:.6rem .48rem .55rem;border-radius: .4rem;
  p{
    margin:.65rem auto;
  }
  img{
    width:2.5rem;
  }
  button{

  }
}
.closeRemindWpr{
  background-color: #fff;
  width:6.8rem;text-align: center;
  font-size: .3rem;color:#000;box-sizing: border-box;
  padding:1.2rem .48rem .52rem;border-radius: .4rem;
  .btn{
    display: inline-block;width:2.8rem;
    &.left {
      background-color:#f1f3f8;margin-right:.1rem;
    }
  }
  p{
    font-size: .38rem;margin-bottom:1.2rem;letter-spacing: .02rem;
  }
}
@keyframes runAwayLeft{
  0%{
    left: 0;top:0;transform: rotateZ(0deg);
  }
  100%{
    left:-12rem;top:2rem;transform: rotateZ(-20deg);
  }
}
@keyframes runAwayRight{
  0%{
    left: 0;top:0;transform: rotateZ(0deg);
  }
  100%{
    left:12rem;top:2rem;transform: rotateZ(20deg);
  }
}
</style>
