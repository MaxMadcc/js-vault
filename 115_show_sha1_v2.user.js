// ==UserScript==
// @name         115网盘显示文件SHA1,删除分享按钮
// @namespace    com.115wangpan.showsha1
// @version      0.4
// @description  标题意思
// @author       YIU
// @match        http*://115.com/*ct=file*
// @grant        unsafeWindow
// ==/UserScript==

var $ = unsafeWindow.$;

//允许重新显示标识
var canDisplay = 0;

function displaySha1(){

    if(canDisplay > 0)
    {

        //在文件列表iframe内，只取非文件夹类型，并且含有sha1属性的DOM
        $('.list-contents li[file_type!="0"][sha1]',$('iframe[rel="wangpan"]')[0]).each(function(){
            var vsha1 = $(this).attr('sha1');
            //$(this).children('.file-detail').append('<span gmflag><br>SHA1: ' + vsha1 + '</span>');
            $(this).children('.file-name').append('<em gmflag1>SHA1: ' + vsha1 + '</em>');
            $(this).children('.file-name').css('top','5px');
            $(this).children('.file-name').css('height','50px');
            $(this).children('.file-name').children('em').css('height','20px');
        });
        //禁止重新显示
        canDisplay = 0;

    }

}

//绑定函数处理方法
function bindfun(e){

    //等待重新显示
    if(canDisplay < 1)
    {
        canDisplay++;

        setTimeout(function(){

            if($('.list-contents li[file_type!="0"][sha1] em:not([gmflag1])',e.target).parents('li').length > 0)
            {
                displaySha1();
            }
            //删除分享按钮
            $('[menu="public_share"]').remove();
            //删除出现"上传 浏览"字眼bug
            $('input[type="file"]').remove();

            canDisplay = 0;

        },100);
    }

}


(function(){

    //绑定文件列表变化事件
    var bind_list = $('#js_data_list',$('iframe[rel="wangpan"]')[0]).on("DOMSubtreeModified",function(e){
        bindfun(e);
    });

    //绑定文件夹点击事件
    $('.list-contents li[file_type="0"]',$('iframe[rel="wangpan"]')[0]).on("click",function(e){
        canDisplay = 0;
        bindfun($(e.target).parents('#js_data_list')[0]);
    });

})();
