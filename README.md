# imsoware

This repository is crap if you're expecting a good cheat.

<img src="https://user-images.githubusercontent.com/76465669/189471116-63e4d4b4-3ec3-4549-8a6f-ba5b525f4d21.png" alt="Cheat in top-right corner" width="570">

What this does:

- Provides groundwork for your cheats
- Provides a TypeScript codebase

## Matchmaker

In true matchmaking nature, the matchmaker helper (defined in [.env](./.env), `WEBPACK_MATCHMAKER_HELPER`) is closed source!

I did this in the past for many reasons:

- Running Yendis WASM code is scary! (It's wrriten in Rust.)
- Matchmaker helper is the most sensitive part of my cheats.

In the interest of this being a viable groundwork for cheats, I feel like it's best to release the source code in the future. I am willing to license out the backend (in a way that doesn't make the source vulnerable ie. run my bytecode)

The API is currently hosted on https://imsoware.sys32.dev/.

Like previous APIs, I will make some efforts to keep this API open.

## Quickstart

1. Clone the repository

```sh
$ git clone https://github.com/e9x/imsoware.git
> Cloning into 'imsoware'...
$ cd imsoware/
```

2. Install dependencies

```sh
$ npm install
```

3. Start the dev server

```sh
$ npm run dev
```

4. Add the [userscript](./imsoware.user.js) (click raw)
5. [Open Krunker](https://krunker.io/)

You may need to wait for the initial dev compilation to finish before going to Krunker.
