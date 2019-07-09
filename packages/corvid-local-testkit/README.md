# Corvid Local Testkit
 This test kit exposes the localMode express server and drivers to the local file system

### Example
Clone Mode:
```
const {server, localSite} = require('corvid-local-testkit')

const cloneLocalSiteDriver = await localSite.init()
const cloneLocalServerDriver = await server.startInCloneMode(localSiteDriver)

```
Edit Mode:
```
const {server, localSite} = require('corvid-local-testkit')

/*
* first you need to get valid local files (clone command)
*/
const localFiles = await cloneLocalSiteDriver.getFiles()

const editLocalSiteDriver = await localSite.init(localFiles)
const editLocalServerDriver = await server.startInEditMode(localSiteDriver)
```
