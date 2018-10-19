// ==UserScript==
// @name         115显示文件sha1
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       Maxmadcc
// @match        http*://115.com/*
// @run-at       document-end
// @grant        none
// ==/UserScript==


function displaySha1() {
  setTimeout(function () {
    //$('div.page-center');
    //$('div.list-cell');
    $('ul.list-contents li').each(function () {
      if ($(this).attr('sha1') != undefined)
      {
        var vsha1 = $(this).attr('sha1');
        $(this).children('.file-detail').append('<span>sha1=' + vsha1 + '</span>');
      }
    });
  }, 800);
}(function () {
  displaySha1();
  $('a[href="javascript:;"]').each(function () {
    $(this).bind('click', function () {
      $('ul.list-contents li').each(function () {
        if ($(this).attr('sha1') != undefined)
        {
          var vsha1 = $(this).attr('sha1');
          $(this).children('.file-detail').append('<span>sha1=' + vsha1 + '</span>');
        }
      });
    });
  });
}) ();
