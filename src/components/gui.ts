import config, { saveConfig } from "../config";
import { toplevelComponent, useEffect } from "../hooks";
import { useModule } from "../loader";
import type { BladeApi, BladeController, View } from "@tweakpane/core";
import * as EssentialsPlugin from "@tweakpane/plugin-essentials";

let fpsGraph:
  | undefined
  | (BladeApi<BladeController<View>> & { begin: () => void; end: () => void });

toplevelComponent(() => {
  useEffect(() => {
    const ui = useModule("ui");

    if (!ui) return;

    const { render } = ui.exports;

    ui.exports.render = function (...args) {
      fpsGraph?.begin();
      const result = render.call(this, ...args);
      // if we did any ticks/additional rendering
      // renderCheese();
      fpsGraph?.end();
      return result;
    };

    return () => {
      if (!ui) return;

      ui.exports.render = render;
    };
  }, []);
});

export async function createPane() {
  // import tweakpane at a later time because DOM isn't ready yet
  const { Pane } = await import(/* webpackMode: 'eager' */ "tweakpane");

  const pane = new Pane({
    title: "Cheese",
  });

  if (process.env.NODE_ENV !== "production") window.pane = pane;

  pane.on("change", saveConfig);

  pane.addInput(config, "bhop");

  pane.registerPlugin(EssentialsPlugin);

  fpsGraph = <typeof fpsGraph>pane.addBlade({
    view: "fpsgraph",
    label: "FPS",
    lineCount: 2,
  });
}

export function fixPane(node: HTMLStyleElement) {
  node.textContent = node.textContent =
    `.tp-dfwv{z-index:2147483646;}.tp-dfwv,.tp-dfwv,.tp-dfwv *{color:revert;font-family:revert}` +
    node.textContent?.replace(
      /((?:color|font-family):.*?)([;}])/g,
      "$1!important$2"
    );
}
