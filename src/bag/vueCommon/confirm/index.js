export default function confirm({state = 1, text = '',callBack = undefined,cancelBack = undefined} = {}) {
    let confirmDom = $('.confirmBox');
    let varTxt = confirmDom.find('var');
    if(text) {
        varTxt.text(text);
        // varTxt.style.marginTop = '.6rem'
    }
    // else {
    //     varTxt.innerText = text;
    //     varTxt.style.marginTop = 0
    // }
    if (state) {
        confirmDom.css('display','flex')
    } else {
        confirmDom.css('display','none')
    }
    $('.confirmBox .no').off('click').click(function () {
        confirm({state:0});
        if(cancelBack) cancelBack();
    });
    $('.confirmBox .yes').off('click').click(function () {
        if(callBack) callBack();
    });
}
