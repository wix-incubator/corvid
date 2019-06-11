<p align="center">
  <img width="200" src="https://raw.githubusercontent.com/wix-incubator/corvid/master/packages/corvid-cli/assets/icon.png">
</p>
<h2 align="center">Corvid Local Development</h2>
<p align="center">
  <b>Download your Wix site, code in a local IDE, collaborate, use git, and more!</b>
</p>
<br>

[![npm version](https://img.shields.io/npm/v/corvid-cli.svg?style=flat)](https://www.npmjs.com/package/corvid-cli)
[![Status](http://img.shields.io/travis/wix-incubator/corvid/master.svg?style=flat)](https://travis-ci.com/wix-incubator/corvid)  

`corvid-cli` allows you to download your [Wix](https://www.wix.com) site and work on it locally. With this tool you can use your favorite development tools (e.g IDE, version control) to manage the code of your site, use the Wix Editor to edit the view, and collaborate with others in building your site. Read more about how to use the corvid-cli [here](https://support.wix.com/en/article/working-with-the-corvid-cli).

## Getting Started

### Prerequisites
Before doing anything else, you need to make sure you have [Node.JS](https://nodejs.org)  version >= 10.0.0 installed and working.


### Getting ready to use corvid-cli

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

### Work on your site

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
