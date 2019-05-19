# Corvid Local Development

## Getting Started

#### Prerequisites
Before doing anything else, you need to make sure you have [Node.JS](https://nodejs.org)  version >= 8.0.0 installed and working.


#### Working on your Wix site in local mode

Initialize a new directory and get it ready for working with the Corvid CLI:
```
npx init-corvid <any-folder-name>
cd <any-folder-name>
```

Download your exising wix site locally:
```
npx corvid clone <your-wix-site-url>
```

Now you can start editing your site site by executing:
```
npx corvid open-editor
```

To find out about other commands, run:
```
npx corvid --help
```



## Contributing

#### Prerequisites
1. Install [Git](https://git-scm.com/).
1. Install [Node.JS](https://nodejs.org), version >= 8.0.0 (we recommend using [NVM](https://github.com/nvm-sh/nvm))
2. Install [Yarn](https://yarnpkg.com/en/docs/install).

#### Bootstrap

1. Clone the repo.
2. Run `yarn` at the root.

#### Modifying dependencies
Remember to only use `yarn` when modifying dependencies.\
Run ```yarn add/remove <package-name>``` inside the module you want to change.\
(we rely on [Yarn Workspaces](https://yarnpkg.com/en/docs/workspaces) to keep links between local modules that depend on each other)

#### Pushing
Make sure ```yarn test``` passes.
