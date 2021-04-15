/*
 * 多宫格抽奖js
 * 备注：这里的速度是切换样式的间隔时间，即setTimeout(functionName, time)中的time值；
 * 速度值越小，间隔越短，转的越快。
 */
 const defaults = {
     selector:     '#lottery',
     count:        7,    // 转盘格子数
     initSpeed:    300,	// 初始转动速度
     speed:        0,	// 当前转动速度
     upStep:       16,   // 加速滚动步长
     upMax:        40,   // 速度上限
     downStep:     40,   // 减速滚动步长
     downMax:      400,  // 减速上限
     waiting:      1000, // 匀速转动时长
     index:        0,    // 初始位置
     target:       3,    // 中奖位置，可通过后台算法来获得，默认值：最便宜的一个奖项或者"谢谢参与"
     isRunning:    false, // 当前是否正在抽奖
     aim:          null, // 获取中奖号，用户可重写该事件，默认随机数字
     beforeRoll:   null, // 抽奖之前的操作，支持用户追加操作
     beforeDown:   null, // 减速之前的操作，支持用户追加操作
     afterStop:    null //结束滚动后的回调函数
 }

var lottery = {

    // 初始化用户配置
    init: function (options) {
        // this.options = $.extend(true, defaults, options)
        this.options = Object.assign({}, defaults, options)
        this.options.speed = this.options.initSpeed
        this.container = $(this.options.selector)
    },

    // // 开启抽奖
    // _enable: function () {
    //   $('.rotate-start').on('click', this.beforeRoll);
    // },
    //
    // // 禁用抽奖
    // _disable: function () {
    //   $('.rotate-start').off('click');
    // },

    // 转盘滚动
    _roll: function () {
      var _this = this
      // _this._disable()
      // console.log(_this._index())
      _this.container.find('[data-index="' + _this._index() + '"]').removeClass("active");
      ++_this.options.index;
      _this.container.find('[data-index="' + _this._index() + '"]').addClass("active");
      _this.rollerTimer = setTimeout(function () { _this._roll(); }, _this.options.speed);
      if (!_this.options.isRunning) {
          _this._up();
          _this.options.isRunning = true;
      }
    },

    // 转盘加速
    _up: function () {
        var _this = this;
        if (_this.options.speed <= _this.options.upMax) {
            _this._constant();
        } else {
            _this.options.speed -= _this.options.upStep;
            _this.upTimer = setTimeout(function () { _this._up(); }, _this.options.speed);
        }
    },

    _constant: function () {
        var _this = this;
        clearTimeout(_this.upTimer);
        if (_this.options.beforeDown) {
          setTimeout(function () {
            _this.options.beforeDown.call(_this);
          }, _this.options.waiting);
        } else {
          // _this._down();
          setTimeout(function () { _this._down(); }, _this.options.waiting);
        }
        // setTimeout(function () { _this.beforeDown(); }, _this.options.waiting);
    },

    // 减速之前的操作，支持用户追加操作（例如：从后台获取中奖号）
    beforeDown: function () {
        var _this = this;
        _this.aim();
        if (_this.options.beforeDown) {
            _this.options.beforeDown.call(_this);
        }
        _this._down();
    },

    // 转盘减速
    _down: function () {
        var _this = this;
        if (_this.options.speed > _this.options.downMax && _this.options.target == _this._index()) {
            _this._stop();
        } else {
            _this.options.speed += _this.options.downStep;
            _this.downTimer = setTimeout(function () { _this._down(); }, _this.options.speed);
        }
    },

    // 转盘停止，还原设置
    _stop: function (state) {
        var _this = this;
        clearTimeout(_this.downTimer);
        clearTimeout(_this.rollerTimer);
        _this.options.speed = _this.options.initSpeed;
        _this.options.isRunning = false;
        if(state == 'clear') {
          return
        }
        if (_this.options.afterStop) {
            _this.options.afterStop.call(_this);
        }
    },

    // 抽奖之前的操作，支持用户追加操作
    beforeRoll: function () {
      var _this = lottery;
      if (_this.options.beforeRoll) {
          _this.options.beforeRoll.call(_this, function () {
              _this._roll();
          });
      }else{
          _this._roll();
      }
    },



    // 转盘当前格子下标
    _index: function () {
      return  this.options.index % this.options.count
    },

    // 获取中奖号，用户可重写该事件，默认随机数字
    aim: function () {
        if (this.options.aim) {
            this.options.aim.call(this);
        } else {
            this.options.target = parseInt(parseInt(Math.random() * 10) * this.count / 10);
            console.log('中奖号',this.options.target);
        }
    }
};


export default lottery
/*初始化抽奖程序*/
// lottery.init({
// 		width: 3,    // 转盘宽度
// 		height: 4,    // 转盘高度
// 		waiting: 2000 // 匀速转动时长
// });
