
# Contributing

### Prerequisites
1. Install [Git](https://git-scm.com/).
1. Install [Node.JS](https://nodejs.org), version >= 10.0.0 (we recommend using [NVM](https://github.com/nvm-sh/nvm))
2. Install [Yarn](https://yarnpkg.com/en/docs/install).

### Bootstrap

1. Clone the repo.
2. Run `yarn` at the root.

### Modifying dependencies
Remember to only use `yarn` when modifying dependencies.\
Run ```yarn add/remove <package-name>``` inside the module you want to change.\
(we rely on [Yarn Workspaces](https://yarnpkg.com/en/docs/workspaces) to keep links between local modules that depend on each other)

### Pushing
Make sure ```yarn test``` passes.