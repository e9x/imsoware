// ==UserScript==
// @name         imsoware
// @namespace    https://github.com/e9x/
// @version      1.0.0-beta.1
// @description  imsoware loader
// @author       e9x
// @match        https://krunker.io/*
// @icon         https://krunker.io/img/favicon.png
// @run-at       document-start
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        unsafeWindow
// ==/UserScript==

/**
 * You must enable Tampermonkey's instant inject feature for this to load correctly!
 * Krunker has taken defensive measures against Tampermonkey.
 *
 * 1. Go to Tampermonkey Dashboard
 * 2. Click on settings
 * 3. Change Config mode to Advanced
 * 4. Scroll to the bottom of the dashboard and find "Experimental". Change Inject Mode to Instant
 */

const http = new XMLHttpRequest();
// Assuming Webpack Dev Server is listening on port 3000:
http.open('GET', 'http://localhost:3000/main.js', false);
http.send();
// eslint-disable-next-line no-eval
eval(http.response);
