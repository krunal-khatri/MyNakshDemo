# MyNaksh Experience Runtime

This is my take on the MyNaksh assignment. It's a small React Native app that gets a list of "experiences" from a (mocked) backend and renders each one. Each experience has its own version, config, loading flow, and error handling. Three are built: Tarot (v1, plus a rough v2), Gemstone Recommendation, and Astrologer Consultation.

## Running it

```bash
yarn install
yarn start      # Metro
yarn android    # or yarn ios, after running bundle exec pod install in ios/
yarn lint
```

It uses Yarn 4 with `nodeLinker: node-modules`, so `node_modules` works the way you'd expect.

The grey "Demo controls" box at the top of the screen lets you break things on purpose. You can take down the config service, make the Gemstone API fail (this one starts on), switch Tarot to v2, or add an experience the app doesn't know about.

## How it's put together

The flow from backend to screen:

```
mocks/backend.ts           fake config endpoint, returns raw JSON
runtime/definitions.ts     parseDefinitions: drops malformed entries
app/HomeScreen.tsx         keeps the enabled ones, renders one host per entry
runtime/ExperienceHost.tsx resolve -> validate config -> load -> render
```

I split the code into three folders, and imports only go one way:

- `src/runtime/` is the shared core: types, the registry, version lookup, the lifecycle reducer, the host, and the error boundary. It only imports React and React Native.
- `src/experiences/<name>/` holds one experience each. Each folder has its own config validation, mock API, UI, and a `register.ts`.
- `src/app/` (plus `App.tsx`) is the screen, the demo controls, and the list of experiences that ship in this build.

Nothing in `src/runtime` knows about any specific experience. You can check with `grep -rniE "tarot|gemstone|consultation" src/runtime`, which finds nothing.

## Registering an experience

Each experience version exports a manifest (see `src/runtime/types.ts`). A manifest has:

- `name` and `version`, which together form the registry key, like `tarot@v1`
- `validateConfig(raw)`, which turns the backend's `config` into a typed config or returns an error
- `load(config)`, which fetches whatever the experience needs
- `Component`, which gets `{ config, data, complete, fail }`

Every experience folder has a `register.ts` that registers its versions. For example, `registerTarot` registers both v1 and v2. `src/app/registerExperiences.ts` calls all of those functions.

I went with an explicit list instead of auto-discovery because Metro bundles statically and can't scan a folder at runtime. Something has to import each experience anyway. Putting that list in the app shell means the runtime never changes when someone adds an experience.

The registry is created once per app with `useState(createAppRegistry)` rather than as a module-level singleton. Otherwise Fast Refresh would register everything a second time, and registering the same `name@version` twice throws.

The runtime never reads `config`. `ExperienceDefinition.config` is typed `unknown` and passed straight to the experience's own validator. Only Tarot knows what `deck` and `maxCards` mean.

## State and lifecycle

There's no global store, because nothing needs one:

- `HomeScreen` keeps the experience list and its loading or error state in `useState`.
- Each `ExperienceHost` runs its own lifecycle with `useReducer`.
- Things like drawn cards or a booking live inside the experience's own component.

The lifecycle in `src/runtime/lifecycle.ts` is a small lookup table of allowed transitions:

```
initializing --LOAD--> loading --READY--> ready --COMPLETE--> completed
     |                   |                  |
     +------FAIL---------+---FAIL/CRASH-----+--> failed --RETRY--> initializing

completed --CRASH--> failed
```

Any transition not in the table is ignored. So calling `complete()` twice, or `fail()` after completing, leaves the card on Completed. Render crashes are the one exception: they fail even a completed card, so a broken UI can't sit there looking finished.

Reloading the list (from a demo toggle or the top-level Retry) remounts every host through its `key`, so each one starts fresh. A card's own Retry button re-runs just that card.

## Versioning

All version picking happens in `resolveVersion()` in `src/runtime/versioning.ts`. Right now it only does exact matches. If the backend asks for a version this build doesn't have, the card shows something like `Failed: Unsupported version "v3" of "tarot" (available: v1, v2)` instead of crashing.

Tarot v1 and v2 are two separate manifests under the same name, and their configs look different. v1 takes `maxCards`, and v2 takes a list of named `spread` positions. They share only the deck API and the `drawCards` helper. Flip "Tarot v2" in the demo controls and the backend starts sending v2.

To get something like "newest compatible version" or a per-experience fallback later, only that one function needs to change.

## When things fail

Each failure only affects its own card. There are three places things can go wrong:

1. **Before rendering.** The experience is unknown, the version is unsupported, the config is bad, or the validator throws. The host catches all of these and shows `Failed: ...`.
2. **During `load()`.** For example, the Gemstone API returns a 503. The host catches it and shows Failed with a Retry button.
3. **During render.** Each experience is wrapped in `ExperienceErrorBoundary`, which shows `Failed: Crashed: ...` with a Retry button.

Error boundaries don't catch errors from async code or event handlers. That's why the host catches `load()` errors itself, and why experiences get a `fail(reason)` prop for errors that happen in their own handlers.

App-level problems are handled separately. If the config service is down, the screen shows the error and a Retry button. A malformed entry in the list is skipped with a console warning, and the rest still render.

To see all of this, run the app. Gemstone is failing from the start, while Tarot and Consultation work fine. Turn off "Gemstone API fails", then press Gemstone's Retry, and it recovers. That toggle doesn't reload the list, so the failed card stays put for you to retry. "Add unknown experience" shows what an unregistered experience looks like, and "Config service fails" shows the app-level error.

## Adding a new experience

Say a team wants to add "Remedies":

1. Create `src/experiences/remedies/` with a `remediesApi.ts` and a `v1/remediesV1.tsx`. The second file exports a config validator, a component, and `remediesV1Manifest`.
2. Add a `register.ts` with `registerRemedies(registry)`.
3. Add one line to `src/app/registerExperiences.ts`.
4. Have the backend send `{ "experience": "remedies", "version": "v1", ... }`.

Nothing in `src/runtime/` changes. A v2 later is a new `v2/` folder and one more `registry.register` call.

## Trade-offs

Some choices I made and what they cost:

- **No third-party libraries for navigation, state, or validation.** The brief asked for that, and React's own state and reducers are enough here. The cost is that the validators are written by hand.
- **One screen showing every experience instead of real navigation.** This makes isolation easy to see, since one card can fail while the others keep working. It isn't how the real product would look.
- **`devFlags` is a mutable object the mocks read from.** It was the quickest way to break things live in the demo. I wouldn't do this in production.
- **`entryPoint` is parsed and shown in each card header, but nothing uses it yet.** The brief didn't say what it should do, so I didn't build a chat container.
- **The registry stores manifests as `ExperienceManifest<any, any>`.** It has to hold manifests with different config types. Each manifest is still type-safe internally, and this is the only `any` in the code.
- **No automated tests.** I ran out of time and checked behaviour by hand with the demo toggles. The lifecycle reducer, `parseDefinitions`, and the validators are pure functions and would be easy to test.

With more time I'd add:

- Tests for the lifecycle, registry, and validators
- A load timeout for each experience
- Lazy loading, so startup stays fast as more experiences are added
- Containers driven by `entryPoint`
- A configurable version fallback
- Lifecycle events from the host for monitoring
- Eventually, each experience in its own package with its own code owners

## Layout

```
src/
  runtime/        types, lifecycle, versioning, registry, definitions, ExperienceHost, ExperienceErrorBoundary
  experiences/
    tarot/        drawCards, tarotApi, v1/, v2/, register
    gemstone/     gemstoneApi, v1/, register
    consultation/ consultationApi, v1/, register
  mocks/          backend, devFlags, delay
  app/            HomeScreen, DemoControls, registerExperiences
```
