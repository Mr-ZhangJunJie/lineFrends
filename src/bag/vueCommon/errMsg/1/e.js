// let _touch = 'createTouch' in document ? 'touchend' : 'click'
let _touch = 'click'

export default function errMsg({state = 1, text = '', isUpdate} = {}){
  if(state) {
    $('.errMsg var').text(text)
    $('.errMsg').css('display', 'flex')
    $('.errMsg .wpr,.errMsg').bind(_touch, function(e){
      e.stopPropagation()
    })
    
    $('.errMsgIn img').bind(_touch, function(){
      hideErrMsg(isUpdate)
    })
    $('.errMsg').bind(_touch, function(e){
      e.stopPropagation()
      hideErrMsg()
    })
    $('.errMsg .close').bind(_touch, function(e){
      e.stopPropagation()
      hideErrMsg()
    })
  } else {
    // document.querySelector('.loading').classList.remove('run')
    // $('.errMsg, .mask').css('display', 'none')
    $('.errMsg').css('display', 'none')
    $('.loading.mask').removeClass('run')

    // $('.errMsg').css('display', 'none')
    $('.errMsg .wpr,.errMsg').unbind(_touch)
    $('.errMsg').unbind(_touch)
    $('.errMsg .close').unbind(_touch)
  }
}

function hideErrMsg(isUpdate) {
  if (isUpdate) {
    window.location.href = 'https://lnk0.com/easylink/ELERZJRh'
  }
  // document.querySelector('.loading').classList.remove('run')
  // $('.errMsg, .mask').css('display', 'none')
  $('.errMsg').css('display', 'none')
  $('.loading.mask').removeClass('run')
  
  // $('.errMsg').css('display', 'none')
  $('.errMsg .wpr,.errMsg').unbind(_touch)
  $('.errMsg').unbind(_touch)
  $('.errMsg .close').unbind(_touch)
}
