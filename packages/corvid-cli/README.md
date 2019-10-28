<p align="center">
  <img width="200" src="https://static.wixstatic.com/media/85a3c2_d1356dc7622b48cab7017b24d9fa922c~mv2.png">
</p>
<h2 align="center">Corvid Local Development</h2>
<p align="center">
  <b>Download your Wix site, code in a local IDE, collaborate, use git, and more!</b>
</p>
<br>

[![npm version](https://img.shields.io/npm/v/corvid-cli.svg?style=flat)](https://www.npmjs.com/package/corvid-cli)
[![Status](http://img.shields.io/travis/wix-incubator/corvid/master.svg?style=flat)](https://travis-ci.com/wix-incubator/corvid)  



> **Important:**
Features relating to the Local Editor are currently in the stage of alpha release and are still being developed. Future functionality may not be backward compatible. When using these features, you assume the risks associated with the use of such an alpha version.

`corvid-cli` allows you to download your [Wix](https://www.wix.com) site and work on it locally. With this tool you can use your favorite development tools (e.g IDE, version control) to manage the code of your site, use the Wix Editor to edit the view, and collaborate with others in building your site. Read more about how to use the corvid-cli [here](https://support.wix.com/en/article/working-with-the-corvid-cli).


## Setup

### Prerequisites
[Node.JS](https://nodejs.org) version >= 10 

### Getting ready to use corvid-cli

Just run:

```
npx create-corvid-app <folder-name> [your-wix-site-url]
```

Sit back and relax while we initialize the specified folder with the recommended setup for working with `corvid-cli`.
If you provide a Wix site URL (optional), we will also download your site into that folder.


## Work on your site

Navigate into the folder you specified above:
```
cd <folder-name>
```

If you didn't provide your Wix site URL when running `create-corvid-app`, download your site:
```
npx corvid clone <your-wix-site-url>
```

To open an Editor so you can edit your site:
```
npx corvid open-editor
```

To find out about other commands, run:
```
npx corvid --help
```
