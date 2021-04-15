export default function loading({state = 1, text = ''} = {}) {
  let loadDom = document.querySelector('.loading')
  // let varTxt = document.querySelector('.loading var')
  // if(varTxt) {
  //   varTxt.innerText = text
  // }

  if(text) {
    let varTxt = document.querySelector('.loading var')
    varTxt.innerText = text
    varTxt.style.marginTop = '.6rem'
  } else {
    let varTxt = document.querySelector('.loading var')
    varTxt.innerText = text
    varTxt.style.marginTop = 0
  }
  // let loadingTimer
  if (state) {
    loadDom.classList.add('run')
    // loadingTimer = setInterval(function(){
    //   if (!window.navigator.onLine){
    //     loading({state:0})
        // alert('请检查网络连接')
        // clearInterval(loadingTimer)
        // return errMsg({text: '请检查网络连接'})
      // }
      // clearInterval(loadingTimer)
    // }, 100)
  } else {
    loadDom.classList.remove('run')
    // clearInterval(loadingTimer)
  }
}
