import { toplevelComponent, useEffect } from "../hooks";
import keys from "../keys";
import type { Player } from "../krunker";
import { inputIndex } from "../krunker";
import { objects, useModule } from "../loader";
import { inputHooks } from "./bhop";

let originalPos: { x: number; y: number; z: number } | undefined;

toplevelComponent(() => {
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;

    const inputHook = (inputs: number[]) => {
      // freeze on server clock
      // inputs[inputIndex.speedLimit] = [];

      // @ts-ignore
      if (unsafeWindow.doHook) {
        try {
          unsafeWindow.doHook(keys, inputs, inputIndex);
        } catch (err) {
          console.error(err);
          unsafeWindow.doHook = undefined;
        }
      } else if (objects.localPlayer) {
        // Attempt some funny work
        // Most of this has been patched
        // I sent an older snippet of fiddling with speedLimit to HighNoon..

        if (keys.has("KeyE")) {
          // @ts-ignore

          if (!originalPos) {
            originalPos = {
              x: objects.localPlayer.x,
              y: objects.localPlayer.y,
              z: objects.localPlayer.z,
            };
          }

          // freeze player
          objects.localPlayer.x = originalPos.x;
          objects.localPlayer.y = originalPos.y;
          objects.localPlayer.z = originalPos.z;
        } else {
          originalPos = undefined;
        }
      }
    };

    inputHooks.push(inputHook);

    return () => {
      inputHooks.splice(inputHooks.indexOf(inputHook), 1);
    };
  }, []);

  useEffect(() => {
    const players = useModule("players");

    if (!players) return;

    const { Player } = players.exports;

    console.log("hooking player");

    // @ts-ignore
    players.exports.Player = function (this: Player, ...args: unknown[]) {
      // eslint-disable-next-line @typescript-eslint/ban-types
      const result = (<Function>(<unknown>Player)).call(this, ...args);

      console.log(this, args);

      console.log(this.isYTMP);

      return result;
    };

    return () => {
      if (!players) return;

      players.exports.Player = Player;
    };
  }, []);
});
