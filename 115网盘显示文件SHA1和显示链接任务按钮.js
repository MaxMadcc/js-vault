// ==UserScript==
// @name         115网盘显示文件SHA1和显示链接任务按钮
// @namespace    com.115wangpan.showsha1
// @version      1.0.1
// @description  显示网盘文件SHA1哈希值、批量复制文件SHA1值、显示链接任务按钮、导出sha1校验文件
// @author       YIU
// @match        http*://115.com/*ct=file*
// @grant        unsafeWindow
// @run-at       document-end
// @license      GPL-3.0-only
// ==/UserScript==

/*
 * ==========================================
 * 修改日志 (Change Log)
 * ==========================================
 * v1.0.1 - 2026-04-06
 *   [新增] 在“复制SHA1”菜单中增加“下载 SHA1 校验文件”选项
 *   [功能] 支持将 SHA1 结果保存为 .txt 文件
 *   [修复] 修复下载功能绑定错误导致的自动下载问题
 *
 * v1.0.0 - [原始版本日期]
 *   [初始] 原始脚本发布
 */

let $ = unsafeWindow.$;

// 添加链接任务按钮的函数
function addLinkTaskButton() {

    // 获取目标元素
    const targetElement = document.querySelector("#js_top_panel_box > div:nth-child(1)");

    if (targetElement) {
        // 检查是否已存在按钮
        const existingButton = targetElement.querySelector('a[id="offline_task_wk35JPO"]');
        if (!existingButton) {
            // 创建按钮
            const buttonHTML = `
                <a href="javascript:;" class="button btn-line btn-upload" menu="offline_task" id="offline_task_wk35JPO">
                    <i class="icon-operate ifo-linktask"></i>
                    <span>链接任务</span>
                    <em style="display:none;" class="num-dot"></em>
                </a>
            `;
            $(targetElement).append(buttonHTML);
        }
    }
}

//* 显示SHA1(要显示的元素,列表类型[0列表型,1图标型])
function displaySha1(dom, listType){
    // 由事件传入的dom元素可能是任何标签,只对含有sha1的文件元素显示sha1
    if(!dom.hasAttribute('sha1')){ return; }

    var sha1 = $(dom).attr('sha1');
    if(listType){
        // 图标型、无法直接显示、只能在提示中显示
        if($(dom).find('em[gmflagsha1]').length > 0){
            $(dom).find('em[gmflagsha1]').remove();
            $(dom).find('em').css('padding-top','');
            $(dom).find('.file-name').css('height','');
            $(dom).find('.file-name').css('position','');
        }
        if(dom.title.indexOf('\r')<1){
            var title = `\r\n${sha1}`;
            dom.title += title;
            $(dom).find('.file-name .name')[0].title += title;
        }
    }
    else if(listType < 1 && $(dom).find('em[gmflagsha1]').length < 1){
        // 列表型
        $(dom).find('.file-name').css('position','initial');
        $(dom).find('.file-name').css('height','50px');
        $(dom).find('em').css('padding-top','6px');
        $(dom).find('.file-name').append(`<em gmflagsha1 style="position:absolute;padding-top:25px;color:#1a273466;font-size: x-small">${sha1}</em>`);
    }
}

// 复制SHA1界面方法
let UI_CopySHA1 = {
    'ui': null,
    'hasBind': false,
    'createCopy': function(type){
        let content = '';
        let contentTitle = '';
        let checkedItems = $('#js_data_list input[checked="checked"]').parent();
        checkedItems.each(function(){
            if(!this.hasAttribute('sha1')){return;}
            contentTitle = $(this).parents('.list-thumb').length > 0 ? $(this).attr('title').split('\n')[0] : $(this).attr('title');
            switch(type){
                case 1:
                    content += `${contentTitle}\n${$(this).attr('sha1')}\n\n`;break;
                case 2:
                    content += `${$(this).attr('sha1')}#${contentTitle}\n`;break;
                case 3:
                    content += `${$(this).attr('sha1')}\n`;break;
                case 4:
                    content += `${$(this).attr('sha1')} *${contentTitle}\n`;
            }
        });
        return content;
    },
    'copySHA1': function(e, type){
        unsafeWindow.oofUtil.plug.copy.initNewCopy({
            btn_parent: e,
            txt: function(){
                return UI_CopySHA1.createCopy(type);
            },
            suc: function(){
                return unsafeWindow.TOP.Core.MinMessage.Show({
                    text: "复制成功",
                    type: "suc",
                    timeout: 2e3
                });
            }
        });
    },
    // --- 修正后的下载方法：专门用于绑定事件 ---
    'bindDownloadEvent': function(element, type) {
        $(element).click(function(e){
            // 1. 生成内容
            let content = UI_CopySHA1.createCopy(type);
            if (!content.trim()) {
                return unsafeWindow.TOP.Core.MinMessage.Show({
                    text: "未选中文件",
                    type: "err",
                    timeout: 2000
                });
            }

            // 2. 创建 Blob 并下载
            let blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
            let link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'SHA1校验文件.sha1'; // 文件名

            document.body.appendChild(link);
            link.click(); // 触发下载
            document.body.removeChild(link); // 清理

            // 3. 提示
            unsafeWindow.TOP.Core.MinMessage.Show({
                text: "下载成功",
                type: "suc",
                timeout: 2000
            });
        });
        return this; // 返回 this 以支持链式调用
    },
    'show': function(show){
        if(!this.ui){ this.createUI(); }
        if(show){ this.ui.show(); }
        else{ this.ui.hide(); }
    },
    'createUI': function(){
        if($('.header-name [gmflagcopysha1ui]').length > 0){return;}

        let hookmenu = false;
        let addmenu = $(`<div class="context-menu" style="top:50px;z-index:9999999;display:none;margin-left:-13px">
<em class="arrow-position" style="left:18px;" rel="js_float_arrow"><i class="arrow"></i><s class="arrow"></s></em>
<div class="cell-icon"><ul></ul></div></div>`).hover(
            function(){ hookmenu = !0; },
            function(){
                hookmenu = !1;
                setTimeout(function(){
                    if(!hookmenu){addmenu.css('display','none');}
                },200);
            });

        let addmenuitem = $(`<li menu="copy_sha1_filename_u" style="display:list-item"><a href="javascript:;" style="">
<i class="icon-operate ifo-copy"></i><span>文件名在上</span></a></li>`);
        this.copySHA1(addmenuitem, 1);
        addmenu.find('ul').append(addmenuitem);

        addmenuitem = $(`<li menu="copy_sha1_filename_r" style="display:list-item"><a href="javascript:;">
<i class="icon-operate ifo-copy"></i><span>文件名在右</span></a></li>`);
        this.copySHA1(addmenuitem, 2);
        addmenu.find('ul').append(addmenuitem);

        addmenuitem = $(`<li menu="copy_sha1_only" style="display:list-item"><a href="javascript:;">
<i class="icon-operate ifo-copy"></i><span>只有SHA1</span></a></li>`);
        this.copySHA1(addmenuitem,3);
        addmenu.find('ul').append(addmenuitem);

        addmenuitem = $(`<li menu="copy_sha1_only" style="display:list-item"><a href="javascript:;">
<i class="icon-operate ifo-copy"></i><span>SHA1校验文件格式</span></a></li>`);
        this.copySHA1(addmenuitem,4);
        addmenu.find('ul').append(addmenuitem);

        // 注意这里 type 传入了 5，或者你可以复用 type 4 的格式
        addmenuitem = $(`<li menu="download_sha1_file" style="display:list-item"><a href="javascript:;">
            <i class="icon-operate ifo-download"></i><span>下载 SHA1 校验文件</span></a></li>`);
        // 绑定下载事件，这里复用 type 4 (校验文件格式) 的内容生成逻辑
        this.bindDownloadEvent(addmenuitem, 4);
        addmenu.find('ul').append(addmenuitem);


        // 绑定所有菜单事件
        addmenu.find('ul li').click(function(){hookmenu=false; addmenu.css('display','none');});
        addmenu.find('a').hover(
            function(){$(this).css('color','#fff');},
            function(){$(this).css('color','');}
        );

        let addbtn = $(`<a href="javascript:;" class="button btn-stroke" style="padding:0 10px;color:#2777F8;top:-2px">
<i class="icon-operate ifo-copy" style="background-position-y:-40px;margin:0 -3px 0 -2px"></i>
<span>复制SHA1</span></a>`).hover(
            function(){addmenu.css('display','block');},
            function(){
                setTimeout(function(){
                    if(!hookmenu){addmenu.css('display','none');}
                },200);
            });

        // 组合UI
        let copyui = $('<div gmflagcopysha1ui></div>');
        copyui.append(addbtn, addmenu);
        $('.header-name').append(copyui);
        this.ui = copyui;
    }
};

// 绑定的事件
let Events = {
    'listChange': function(){
        //-- 文件列表变化
        // 先解除先前绑定
        this.listChangeOff();
        $('#js_data_list').on("DOMSubtreeModified",function(e){
            // 防止修改元素造成死循环
            Events.listChangeOff();
            displaySha1(e.target, $('#js_data_list').find('.list-thumb').length);

            // 有文件列表时绑定文件勾选事件
            if($('#js_data_list ul li').length > 0 && !UI_CopySHA1.hasBind){
                Events.fileChecked();
            }else if($('#js_data_list ul li').length < 1 && UI_CopySHA1.hasBind){
                UI_CopySHA1.show(!1);
                UI_CopySHA1.ui = null;
                UI_CopySHA1.hasBind = !1;
            }
            // 重新绑定本事件
            Events.listChange();
        });
    },
    'listChangeOff': function(){
        //-- 解除文件列表变化绑定事件
        $('#js_data_list').off("DOMSubtreeModified");
    },
    'fileChecked': function(){
        //-- 文件列表勾选
        let bindlist = $('#js_data_list ul')[0];
        let config = { attributes: true, attributeFilter:['checked'], subtree: true };
        if(!bindlist){return;}

        new MutationObserver(function(mutations){
            let isChecked = false;
            let forCount = 0;
            for(let mutation of mutations){
                if(forCount > 1){ break; }
                if(mutation.type === 'attributes' && mutation.target.parentNode && mutation.target.parentNode.hasAttribute('sha1')){
                    isChecked = isChecked || mutation.target.checked;
                    forCount += isChecked ? 1 : 0;
                }
            }
            UI_CopySHA1.show(isChecked);
        }).observe(bindlist, config);
        UI_CopySHA1.hasBind = !0;
    }
};

//* 执行开始
(function(){
    // 绑定事件
    Events.listChange();

    // 添加链接任务按钮（仅在包含&mode=wangpan的页面）
    addLinkTaskButton();

    // 确保在面板加载后添加按钮
    const observer = new MutationObserver(function() {
        addLinkTaskButton();
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

})();
