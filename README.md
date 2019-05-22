# Corvid Local Development

## Getting Started

### Prerequisites
Before doing anything else, you need to make sure you have [Node.JS](https://nodejs.org)  version >= 8.0.0 installed and working.


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
