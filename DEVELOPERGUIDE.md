# Zea Engine

A high performance 3D rendering engine for the web.

## Building the Engine 

1. Install Git.
2. Install Node.js from here: https://nodejs.org/en/download/ using the default options. It should be straight forward.
3. Install dependencies.

- Install the [Yarn package manager](https://yarnpkg.com/) (it should be included in the latest Node.js version).
- Run `yarn install`

4. Build:

- See the [scripts section](#scripts) below.

## Scripts

Note: The Zea Engine documentation uses `yarn` commands, but `npm` will also work. You can compare `yarn` and `npm` commands in the [yarn docs, here](https://yarnpkg.com/en/docs/migrating-from-npm#toc-cli-commands-comparison).

- `yarn run build` - Produces the production version of ZeaEngine.
- `yarn run build:watch` - Produces the development version of ZeaEngine and triggers a re-compilation on file changes.

## Running unit tests

In your development environment you can run:

```bash
yarn test
```

Or, to trigger a re-compilation on file changes:

```bash
yarn run test:watch
```

In your CI environment you can run:

```bash
yarn install --frozen-lockfile --ignore-scripts
yarn run build
yarn test
```

## Debugging unit tests

1. In your development environment, run:

```bash
yarn run test:debug
```

2. In your Chromium based browser, use this address to open the inspector: `chrome://inspect/#devices`

3. From the list of targets, click the one that corresponds to the Zea Engine.

4. Use the [debugger statement](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/debugger) to add breakpoints to your code.

5. Your browser will reload and now you're ready to start debugging.

## Typical development workflow

1. Open your preferred terminal.

2. Navigate to the directory containing the ZeaEngine sources. E.g. `cd ~/your-dir/zea-engine/`

3. Build ZeaEngine in development mode:

- Run `yarn run build:watch`. Produces the development version of ZeaEngine and triggers a re-compilation on file changes.

## About E2E testing

The End-to-End (E2E) testing technique allows us to ensure that the rendering results are always the expected ones.
We use the [Percy visual review platform](https://percy.io/) to capture and compare snapshots.
It's also a very important part of our CI/CD workflow, so we can catch and fix bugs as soon as they happen.

### How to run the E2E tests

1. From the [Percy project settings](https://percy.io/36dba56e/zea-engine/settings), copy the _project token_.

2. In your terminal, assign the _project token_ to an environment variable. For convenience, you can use a tool such as [direnv](https://direnv.net/).

3. Run:

```bash
yarn run test:e2e
```

Or, if you want to inspect the tests as they run:

```bash
yarn run test:e2e:watch
```

### How to set up a new E2E test

1. Run:

```bash
yarn generate e2e-test
```

You'll be prompted for the test's name.

### Debugging E2E tests

The testing framework launches chrome in headless mode, which uses an emulated software GPU called the Google Swiftshader. 
 > https://github.com/google/swiftshader

 While fast, the swiftshader is an order of magnitude slower than discrete GPUs. To run the e2e tests in non-headless mode, while also running the swiftshader, launch chrome with the following flags.

 ```
 "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" --disable-gpu
 ```

 > Note: the SwiftShader GPU is detected as a 'low-end' GPU and so runs all code at the same quality settings as mobile devices. 

## Publishing a new release

1. All unit and E2E tests must be passing.

2. To generate the release notes and bump the version, run:
```bash
yarn run release
```
This will generate a tag in the repo. This tag will be the basis of the next release.

3. Regenerate the API docs

Clean up te CHANGELOG.md, check for spelling issues and other inconsistencies.

```bash
yarn docs
```
Commit changes.

4. Push the main branch and the tags in one action like this. This will cause a publish to NPM
```bash
git push --follow-tags origin main
```

6. Check that the release process completes in GitHub.

https://github.com/ZeaInc/zea-engine/actions


### Publishing a pre-release

Pre-releases are potentially unstable releases meant for tests of new features before they are published to an production release.

This command automatically calculates the next stable version and a release candidate version.

```bash
yarn version --prerelease --preid rc
```

```bash
yarn publish --tag preid
```

Adds an identifier specified by <pre-identifier> to be used to prefix premajor, preminor, prepatch or prerelease version increments.
```bash
yarn version --prerelease --preid <pre-identifier>
```


