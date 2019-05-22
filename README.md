# Corvid Local Development

## Getting Started

#### Prerequisites
Before doing anything else, you need to make sure you have [Node.JS](https://nodejs.org)  version >= 8.0.0 installed and working.


#### Getting ready to use corvid-cli

Create a new empty directory that will contain your site files and cd into it:
```
mkdir <any-folder-name>
cd <any-folder-name>
```

Initialize a package.json file so that you can install local dependencies:
```
npm init -y
```

Install corvid-cli as a local development dependency:
```
npm install --save-dev corvid-cli
```

#### Work on your site

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
