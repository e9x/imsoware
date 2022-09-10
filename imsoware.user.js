// ==UserScript==
// @name         imsoware
// @namespace    https://github.com/e9x/
// @version      1.0.0-beta.1
// @description  Try to take over the world!
// @author       e9x
// @match        https://krunker.io/*
// @icon         https://krunker.io/img/favicon.png
// @run-at       document-start
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==

const http = new XMLHttpRequest();
// Assuming Webpack Dev Server is listening on port 3000:
http.open('GET', 'http://localhost:3000/main.js', false);
http.send();
// eslint-disable-next-line no-eval
eval(http.response);
