const io = require('socket.io-client')
const path = require('path')
const _ = require('lodash')

const getLocalServerURL = port => `http://localhost:${port}`

const connectToLocalServer = port => {
  return new Promise((resolve, reject) => {
    const socket = io.connect(getLocalServerURL(port))
    socket.once('disconnect', () => {
      socket.removeAllListeners()
      socket.close()
      reject('MULTIPLE_CONNECTIONS_SOKET_DISCONECTED')
    })
    socket.once('connected', () => {
      socket.removeAllListeners()
      resolve(socket)
    })
  })
}

const sendRequest = async (socket, event, payload) =>
  new Promise((resolve, reject) => {
    socket.emit(event, payload, (err, response) => {
      if (err) {
        reject(err)
      } else {
        resolve(response)
      }
    })
  })

const isCloneMode = async socket => sendRequest(socket, 'IS_CLONE_MODE')

const updateSiteDocument = async (socket, siteDocument) =>
  sendRequest(socket, 'UPDATE_DOCUMENT', siteDocument)

const updateCodeFiles = (socket, payload) =>
  sendRequest(socket, 'UPDATE_CODE', payload)

const saveLocal = async (socket, siteDocument, toSaveCodePayload) => {
  await updateSiteDocument(socket, siteDocument)
  await updateCodeFiles(socket, toSaveCodePayload)
}

const setValueAtPath = (fullPath, value) => {
  if (fullPath.length === 0) {
    return value
  }
  const parts = fullPath.split(path.sep)
  const [head, ...tail] = parts
  return { [head]: setValueAtPath(tail.join(path.sep), value) }
}

const toFlat = (data, pathParts = []) =>
  Object.keys(data).reduce((result, pathPart) => {
    const value = data[pathPart]
    if (_.isString(value)) {
      return _.merge(result, {
        [[...pathParts, pathPart].join(path.sep)]: value
      })
    }
    return _.merge(result, toFlat(value, [...pathParts, pathPart]))
  }, {})

const convertPayloadToFlat = payload => payload.modifiedFiles

const toHierarchy = data =>
  Object.keys(data).reduce(
    (result, fullPath) =>
      _.merge(result, setValueAtPath(fullPath, data[fullPath])),
    {}
  )

const updateCodeFilesFromPayload = (codeFiles, payload) => {
  let flatFiles = toFlat(codeFiles)
  const { modifiedFiles, copiedFiles, deletedFiles } = payload
  Object.keys(modifiedFiles).map(
    filePath => (flatFiles[filePath] = modifiedFiles[filePath])
  )
  copiedFiles.forEach(({ sourcePath, targetPath }) => {
    flatFiles[targetPath] = flatFiles[sourcePath]
  })
  deletedFiles.forEach(filepath => delete flatFiles[filepath])
  return toHierarchy(flatFiles)
}

const getCodeFilesFromServer = async socket => sendRequest(socket, 'GET_CODE')
const getSiteDocumentFromServer = async socket =>
  sendRequest(socket, 'GET_DOCUMENT')

const loadEditor = async (
  port,
  { siteDocument: remoteSiteDocument, siteCode: remoteSiteCode } = {}
) => {
  let siteDocument = remoteSiteDocument || {}
  let codeFiles = remoteSiteCode || {}
  let toSaveCodePayload = {
    modifiedFiles: toFlat(codeFiles),
    copiedFiles: [],
    deletedFiles: []
  }

  let socket
  try {
    socket = await connectToLocalServer(port)
    if (socket.connected) {
      const isInCloneMode = await isCloneMode(socket)
      if (isInCloneMode) {
        await saveLocal(socket, siteDocument, toSaveCodePayload)
        toSaveCodePayload = {
          modifiedFiles: {},
          copiedFiles: [],
          deletedFiles: []
        }
      } else {
        const payload = await getCodeFilesFromServer(socket)
        codeFiles = toHierarchy(convertPayloadToFlat(payload))
        siteDocument = await getSiteDocumentFromServer(socket)
      }
    }
  } catch (err) {
    // TODO: handle connection error
    console.log(err) // eslint-disable-line no-console
  }

  return {
    close: () => {
      if (socket && socket.connected) {
        socket.disconnect()
      }
    },
    isConnected: () => !!(socket && socket.connected),
    getSiteDocument: () => siteDocument,
    getCodeFiles: () => codeFiles,
    save: async () => {
      await saveLocal(socket, siteDocument, toSaveCodePayload)
      codeFiles = updateCodeFilesFromPayload(codeFiles, toSaveCodePayload)
    },
    modifyCodeFile: (filePath, content) => {
      toSaveCodePayload = _.merge(toSaveCodePayload, {
        modifiedFiles: { [filePath]: content }
      })
    },
    copyCodeFile: (sourcePath, targetPath) =>
      toSaveCodePayload.copiedFiles.push({ sourcePath, targetPath }),
    deleteCodeFile: filePath => toSaveCodePayload.deletedFiles.push(filePath)
    // modifyDocument,
  }
}

module.exports = loadEditor
