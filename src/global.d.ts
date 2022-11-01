/* eslint-disable no-var */
import type { GameModules, GameObjects } from "./loader";
import type { Pane } from "tweakpane";

declare global {
  var modules: undefined | Partial<GameModules>;
  var objects: undefined | Partial<GameObjects>;
  var pane: undefined | Pane;

  interface Window {
    // eslint-disable-next-line no-var
    doHook:
      | ((keys: Set<string>, inputs: number[], inputIndex: any) => void)
      | undefined;
  }
}
