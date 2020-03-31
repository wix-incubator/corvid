
# Contributing

### Prerequisites
1. Install [Git](https://git-scm.com/).
1. Install [Node.JS](https://nodejs.org), version >= 10.0.0 (we recommend using [NVM](https://github.com/nvm-sh/nvm))
2. Install [Yarn](https://yarnpkg.com/en/docs/install).

### Bootstrap

1. Clone the repo.
2. Execute `yarn` at the root.
3. Create a `.env` file at the root, based on the `.env.template` file but with actual values.

### Running with the local CLI

1. Execute `yarn link` at the root.
2. Execute the globally installed binaries `dev-corvid` or `dev-corvid-debug` "anywhere" to use the local CLI.

### Modifying dependencies
Remember to only use `yarn` when modifying dependencies.\
Execute ```yarn add/remove <package-name>``` inside the module you want to change.\
(we rely on [Yarn Workspaces](https://yarnpkg.com/en/docs/workspaces) to keep links between local modules that depend on each other)

### Commits
We are using [conventional commits](https://conventionalcommits.org/), enforced by [@commitlint/config-conventional](https://github.com/conventional-changelog/commitlint/tree/master/%40commitlint/config-conventional).

### Pushing
Make sure ```yarn test``` passes.

### Publishing a new version
1. ```yarn release``` in the master branch. this will update relevant package.json files, commit them and create a new git tag.
2. ```git push --follow-tags```. this will push the changes including the new tag.
3. travis will catch the new tag and publish the version (```yarn ci:publish```) assuming the build passes.
