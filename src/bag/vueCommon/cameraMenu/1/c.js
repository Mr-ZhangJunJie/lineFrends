
// let _touch = 'createTouch' in document ? 'touchend' : 'click'
let _touch = 'click'

export default function cameraMenu({state = 1} = {}){
  if(state) {
    $('.cameraMenu').css('display', 'flex')
    $('.cameraMenu .cameraMenuWpr').one(_touch, function(e){
      e.stopPropagation()
    })
    $('.cameraMenu').one(_touch, function(){
      hideSelectBox()
    })
  } else {
    hideSelectBox()
  }
}

function hideSelectBox(cb){
  $('.cameraMenu').css('display', 'none')
  $('.cameraMenu .cameraMenuWpr').unbind(_touch)
  $('.cameraMenu').unbind(_touch)
  $('.cameraMenu button').unbind(_touch)
  if (cb)cb()
}
