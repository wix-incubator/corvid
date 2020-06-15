<p align="center">
  <img width="200" src="https://static.wixstatic.com/media/85a3c2_d1356dc7622b48cab7017b24d9fa922c~mv2.png">
</p>
<h2 align="center">Corvid Local Development</h2>
<p align="center">
  <b>Download your Wix site, code in a local IDE, collaborate, use git, and more!</b>
</p>
<br>

[![npm version](https://img.shields.io/npm/v/corvid-cli.svg?style=flat)](https://www.npmjs.com/package/corvid-cli)



> **Important:**
Features relating to the Local Editor are currently in the stage of alpha release and are still being developed. Future functionality may not be backward compatible. When using these features, you assume the risks associated with the use of such an alpha version.

The Corvid CLI allows you to download a [Wix](https://www.wix.com) site and work on it locally. With this tool you can use your favorite development tools (e.g IDE, version control) to manage the code on your site, a local Wix Editor to edit your site's look and feel, and collaborate with others in building your site. Read more about how to use the Corvid CLI [here](https://support.wix.com/en/article/working-with-the-corvid-cli).


## Setup

### Prerequisites
[Node.JS](https://nodejs.org) version >= 10 

### Prepare a Local Project

1. [Enable Corvid](https://support.wix.com/en/article/about-corvid-by-wix#to-enable-corvid-on-your-site) using the Regular Editor in the site that you want to work on locally.
1. Run `create-corvid-app` as follows, replacing the placeholders with values as described below:

    ```
    npx create-corvid-app <folder-name> [your-wix-site-url]
    ```
  
    + `<folder-name>`: A local directory where you want to store your local site project. If the directory doesn't exist, it will be created.
    + `[your-wix-site-url]`(optional): The public URL of your published site or your site's Regular Wix Editor URL.
    
    Before your project downloads, if you are not already authenticated, a Wix authentication screen will open where you must enter your Wix credentials. You need to authenticate with a user whose role has **Editor** permissions for the site.
  
1. If you did not provide a URL when running `create-corvid-app` you can clone your site into the project directory using the `clone` command:

    ```
    npx corvid clone <your-wix-site-url>
    ```

## Work on Your Site Locally

When working on your local site, you edit your site's code in your preferred IDE and edit your site's look and feel in the Local Wix Editor.

### Code

To edit your site's code, open your site's local project directory in your preferred IDE. When you make changes to your local code files, and you save those changes in your IDE, those changes are immediately synced to the [Local Wix Editor](https://support.wix.com/en/article/corvid-working-with-the-local-editor).

### Look and Feel

Editing the local version of your site's UI and previewing your local site is done through the [Local Wix Editor](https://support.wix.com/en/article/corvid-working-with-the-local-editor).

To open your local site project in a Local Wix Editor:

1. Navigate to the folder you specified above:
    ```
    cd <folder-name>
    ```

1. Open a Local Wix Editor:
    ```
    npx corvid open-editor
    ```

## Learn More

To learn about what else you can do with the Corvid CLI, run:
```
npx corvid --help
```

Or check out these articles about working on your Wix site locally:
+ [About Local Site Projects](https://support.wix.com/en/article/corvid-about-local-site-projects-and-team-collaboration)
+ [Working with the Corvid CLI](https://support.wix.com/en/article/working-with-the-corvid-cli)
+ [Working with the Local Editor](https://support.wix.com/en/article/corvid-working-with-the-local-editor)
+ [Updating Local Site Projects](https://support.wix.com/en/article/corvid-updating-local-site-projects)
+ [Local Site Project Structure](https://support.wix.com/en/article/corvid-local-site-project-structure)
