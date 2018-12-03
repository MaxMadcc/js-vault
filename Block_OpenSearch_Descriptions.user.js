// ==UserScript==
// @name            [ALL] Block OpenSearch Descriptions (OSD)
// @author
// @description     Block sites from adding search engines to Chrome.
// @downloadURL
// @grant
// @icon
// @include         http*://*
// @require
// @run-at          document-start
// @updateURL
// @version         1.0
// ==/UserScript==

//document.querySelector('[type="application/opensearchdescription+xml"]').remove();
//////////////////////////////////////////////////////////////////////////////
// OpenSearch - e.g., https://martin-thoma.com/search-engine-autodiscovery/
// Uses CSS4 selectors, Chrome 49+
document.querySelectorAll('[type="application/opensearchdescription+xml" i]').forEach(
    function (it) {
        it.removeAttribute('type');
        // console.info({"Spoiled by type removal": it});
    }
);

// Suggestion service, https://www.chromium.org/tab-to-search
document.querySelectorAll('url[rel="suggestions" i]').forEach(
    function (it) {
        it.removeAttribute('rel');
        // console.info({"Spoiled by rel removal": it});
    }
);
