import { createPane, fixPane } from "./components/gui";
import "./loader";
import "./components/bhop";
import "./components/gui";
import "./components/esp";
import "./components/test";
import { modules, objects } from "./loader";

console.log("Hack init");

if (process.env.NODE_ENV !== "production") {
  global.modules = modules;
  global.objects = objects;
}

const mutationObserver = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    for (const node of mutation.addedNodes) {
      if (node instanceof HTMLBodyElement) {
        createPane();
      } else if (
        node instanceof HTMLStyleElement &&
        node.dataset.tpStyle === "default"
      ) {
        fixPane(node);
        mutationObserver.disconnect();
      }
    }
  }
});

mutationObserver.observe(document, { subtree: true, childList: true });
