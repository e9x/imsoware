import { renderData, toplevelComponent, useEffect, useState } from "./hooks";
import type {
  Game,
  Config,
  Player,
  World,
  Socket,
  Canvas,
  Util,
} from "./krunker";
import type { Renderer } from "three";

interface Token {
  sid: number;
  cfid: number;
  token: string;
}

type ClientKey = number[];

const matchmaker = process.env.WEBPACK_MATCHMAKER!;
const matchmakerHelper = process.env.WEBPACK_MATCHMAKER_HELPER!;

async function clientKey(): Promise<ClientKey> {
  return await (await fetch(new URL("clientKey", matchmakerHelper))).json();
}

async function source(): Promise<string> {
  return await (await fetch(new URL("source", matchmakerHelper))).text();
}

async function hashToken(data: Token): Promise<number[]> {
  return await (
    await fetch(new URL("hashToken", matchmakerHelper), {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(data),
    })
  ).json();
}

async function generateToken(clientKey: ClientKey): Promise<Token> {
  return await (
    await fetch(new URL("generate-token", matchmaker), {
      headers: {
        "client-key": clientKey.join(","),
      },
    })
  ).json();
}

const loadGame = new Promise<void>((resolve) => {
  const { fetch } = window;

  // prevent original loader from happening
  unsafeWindow.fetch = (url, init) => {
    if (url === "/pkg/loader.js") {
      unsafeWindow.fetch = fetch;
      resolve();
      return Promise.resolve(new Response(""));
    }

    return fetch(url, init);
  };
});

async function createToken(): Promise<number[]> {
  return await hashToken(await generateToken(await clientKey()));
}

export interface Module {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  exports: any;
  i: string;
}

export interface ModuleUI extends Module {
  exports: {
    render: (...args: unknown[]) => unknown;
    scale: number;
    canvas: HTMLCanvasElement;
  };
}

export interface ModulePlayers extends Module {
  exports: {
    manager: {
      new (...args: unknown[]): unknown;
    };
    Player: Player;
  };
}

export interface ModuleWorld extends Module {
  exports: () => unknown;
}

export interface ModuleGameInstance extends Module {
  exports: {
    obj: (...args: unknown[]) => Game;
  };
}

export interface ModuleConfig extends Module {
  exports: Config;
}

export interface GameModules {
  config: ModuleConfig;
  ui: ModuleUI;
  instance: ModuleGameInstance;
  players: ModulePlayers;
  world: ModuleWorld;
}

export interface GameObjects {
  game: Game;
  world: World;
  renderer: Renderer;
  localPlayer: Player;
  util: Util;
  canvas: Canvas;
  socket: Socket;
}

/*
console.log(module.exports);
const og = module.exports.render;

module.exports.render = function (...args: any[]) {
	console.log(module.exports, 'called me');
	return og.call(this, ...args);
}
*/

const searchFilters: {
  [K in keyof GameModules]: (
    module: Readonly<GameModules[K]>
  ) => void | boolean;
} = {
  config(module) {
    if (typeof module.exports?.gameVersion === "string") {
      return true;
    }
  },
  ui(module) {
    if (
      typeof module.exports?.render === "function" &&
      typeof module.exports.canvas === "object"
    ) {
      return true;
    }
  },
  instance(module) {
    if (typeof module.exports?.obj === "function") {
      return true;
    }
  },
  players(module) {
    if (
      typeof module.exports?.manager === "function" &&
      typeof module.exports.Player === "function"
    ) {
      return true;
    }
  },
  world(module) {
    if (
      typeof module.exports === "function" &&
      module.exports.toString().includes("pchObjc=")
    ) {
      return true;
    }
  },
};

export const objects: Partial<GameObjects> = {};

export const modules: Partial<GameModules> = {};

type UpdateEnt<T> = [keyof T, () => void];

const moduleUpdates: UpdateEnt<GameModules>[] = [];
const objectUpdates: UpdateEnt<GameObjects>[] = [];

const updateObjects = <T extends keyof GameObjects>(
  key: T,
  value: GameObjects[T]
) => {
  objects[key] = value;
  for (const [use, callback] of objectUpdates) if (use === key) callback();
};

const updateModules = <T extends keyof GameModules>(
  key: T,
  value: GameModules[T]
) => {
  modules[key] = value;
  for (const [use, callback] of moduleUpdates) if (use === key) callback();
};

export const useModule = <T extends keyof GameModules>(
  use: T
): typeof modules[T] => {
  const [module, setModule] = useState(modules[use]);

  useEffect(() => {
    const callback: UpdateEnt<GameModules> = [
      use,
      () => {
        setModule(modules[use]);
      },
    ];

    moduleUpdates.push(callback);

    return () => {
      moduleUpdates.splice(moduleUpdates.indexOf(callback), 1);
    };
  }, []);

  return module;
};

export const useObject = <T extends keyof GameObjects>(
  use: T
): typeof objects[T] => {
  const [object, setObject] = useState(objects[use]);

  useEffect(() => {
    const callback: UpdateEnt<GameObjects> = [
      use,
      () => {
        setObject(objects[use]);
      },
    ];

    objectUpdates.push(callback);

    return () => {
      objectUpdates.splice(objectUpdates.indexOf(callback), 1);
    };
  }, []);

  return object;
};

toplevelComponent(() => {
  useEffect(() => {
    const instance = useModule("instance");

    if (!instance) return;

    const { obj } = instance.exports;

    instance.exports.obj = function (this: Game, ...args) {
      const result = obj.call(this, ...args);

      updateObjects("game", this);

      return result;
    };

    return () => {
      instance.exports.obj = obj;
    };
  }, []);

  useEffect(() => {
    const world = useModule("world");

    if (!world) return;

    const World = world.exports;

    /*
		objects.renderer = renderer;
		objects.util = util;
		objects.socket = socket;
		objects.canvas = canvas;
		*/

    // @ts-ignore
    world.exports = function (
      this: World,
      ...args: [
        render: Module, // identical to render lib: genBody, invisMat, GEOS
        endscreen: Module, // identical to endscreen lib: showEndScreen, isMobile
        utils: Module, // identical to utils lib: emptyString, compressNumArray, byte shift stuff
        server: Module, // identical to servers lib: capFlag, addScripts, AI
        config: Module, // identical to config data: apiURL, esportNews, assets
        socket: Socket, // identical to socket lib: ahNum, socket, send
        overlay: Module // identical to overlay lib: bloodCustom, ctx, canvas
      ]
    ) {
      console.log(this, args);

      // eslint-disable-next-line @typescript-eslint/ban-types
      const result = (<Function>(<unknown>World)).call(this, ...args);

      updateObjects("world", this);

      return result;
    };

    return () => {
      world.exports = World;
    };
  }, []);

  useEffect(() => {
    const game = useObject("game");

    if (!game) return;

    const { add } = game.players;

    game.players.add = function (...args) {
      const player = add.call(this, ...args);

      if (player.isYTMP) updateObjects("localPlayer", player);

      return player;
    };
  }, []);
});

const modulesPromise: Promise<GameModules> = new Promise<GameModules>(
  // eslint-disable-next-line no-async-promise-executor
  async function load(resolve, reject) {
    const token = createToken();
    const src = await source();

    // not an array of modules
    const giveMeTheModules = (module: Module) => {
      for (const name in searchFilters) {
        if (searchFilters[name as keyof GameModules](module)) {
          updateModules(name as keyof GameModules, module);
          console.log(`Module ${module.i} was ${name}`);

          renderData();

          break;
        }
      }
    };

    const giveMeTheModules_s = `_${Math.random().toString(36).slice(2)}`;

    const patched =
      src.replace(
        /(\w+)\.exports}\w+\.m=/,
        (match, module) => `${giveMeTheModules_s}(${module}),${match}`
      ) + "//# sourceURL=krunker";

    await loadGame;

    new Function("WP_fetchMMToken", giveMeTheModules_s, patched)(
      token,
      giveMeTheModules
    );

    for (const name in searchFilters) {
      if (!(name in modules)) {
        reject(`Did not match ${name}`);
        return;
      }
    }

    resolve(<GameModules>(<unknown>modules));
  }
);

export default modulesPromise;
