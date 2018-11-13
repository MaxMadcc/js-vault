// ==UserScript==
// @name         对页面的所有checkbox的不勾选
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       ulrevenge
// @match        http*://anyweb.curd.io
// @require      http://cdn.bootcss.com/jquery/3.1.0/jquery.min.js
// @grant        none
// @run-at      document-end
// ==/UserScript==

(function() {
    $('input[type=\'checkbox\']').each(function () {
        $(this).prop('checked', false);
    });
})();
