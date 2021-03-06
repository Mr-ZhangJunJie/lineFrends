let _touch = 'click'

export function showSelectBox({state = 1} = {}){
  if(state) {
    $('.selectBox').css('display', 'flex')
    $('.selectBox .owpr').one(_touch, function(e){
      e.stopPropagation()
    })
    $('.selectBox').one(_touch, function(){
      hideSelectBox()
    })
  } else {
    hideSelectBox()
  }

  // $('#galleryBtn').one(_touch, function(){
  //   // tryEventCamera('imageAlbum')
  //   console.log('11')
  //   // _hmt.push(['_trackEvent', 'youth'+ inState + '-btn', 'click', '从相册选'])
  // })
  // $('#cameraChoose').one(_touch, function(){
  //   tryEventCamera('imageCamera')
  //   // _hmt.push(['_trackEvent', 'youth'+ inState + '-btn', 'click', '从相机拍照'])
  // })
}

export function hideSelectBox(cb){
  $('.selectBox').css('display', 'none')
  $('.selectBox .wpr').unbind(_touch)
  $('.selectBox').unbind(_touch)
  $('.selectBox .cameraMenuBtn').unbind(_touch)
  if (cb)cb()
}
