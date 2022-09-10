# imsoware

This repository is crap if you're expecting a good cheat.

<img src="https://user-images.githubusercontent.com/76465669/189471116-63e4d4b4-3ec3-4549-8a6f-ba5b525f4d21.png" alt="Cheat in top-right corner" width="570">

What this does:

- Provides groundwork for your cheats
- Provides a TypeScript codebase

## Matchmaker

In true matchmaking nature, the matchmaker helper (defined in [.env](./.env), `WEBPACK_MATCHMAKER_HELPER`) is closed source!

I did this in the past for many reasons:

- Running Yendis WASM code is scary! (It's wrriten in Rust)
- Matchmaker helper is the most sensitive part of my cheats.

In the interest of this going beyond crap, I feel like it's best to release the source code in the future. I am willing to license out the backend (in a way that doesn't make the source vulnerable, run my bytecode!)

The API is currently hosted on https://imsoware.sys32.dev/.

Like previous APIs, I will make some efforts to keep this API open.