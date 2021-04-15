<template>
    <div class="rotCont">
      <div id="lottery" class="blink">
          <div class="group-wrap">
              <div class="parts">
                <div class="partsWpr">
                  <span v-for="(item, index) in suit" :data-index="index" :class="[item.drawn ? 'drawn': '', item.draw ? 'draw': '']"><img v-if="item.itemId" :src="_itemPicPrefix + item.itemId" /></span>
                </div>
              </div>
          </div>
      </div>
    </div>
</template>

<script>

export default {
  name :'',
  props:{
    suits: {
      type: Array,
      default: []
    },
    swipeRealIndex: 0,
    _itemPicPrefix:''
  },
  data() {
    return {
      suit: []
    }
  },
  mounted() {
    // console.log('_parts2', this.suit, this._itemPicPrefix);
  },
  watch: {
    suits: function(val) {
      console.log('子组件接收到新的 suits', val);
      this.suit = this.suits[this.swipeRealIndex]
      this.$forceUpdate()
      // this.suit = val
    },
    swipeRealIndex : function(val) {
      console.log('子组件接收到新的 swipeRealIndex', val);
      this.suit = this.suits[this.swipeRealIndex]
      this.$forceUpdate()
    }
  },
  // computed: {
  //   suit() {
  //     return this.suits[this.swipeRealIndex]
  //   }
  // }
}
</script>

<style>
/*抽奖外容器*/
.rotCont{
  width:100%;
}
#lottery{background-position:center center;background-repeat:no-repeat;background-size: 100% 100%;}

</style>
