const separator = ":";
function clientMessageActions(messageMap) {
  return (event, level, consoleMsg) => {
    for (const [message, action] of Object.entries(messageMap)) {
      if (consoleMsg.startsWith(message)) {
        const messageToPass = consoleMsg
          .replace(message, "")
          .replace(new RegExp(`^${separator}`), "");
        action(messageToPass, level, event);
      }
    }
  };
}

module.exports = clientMessageActions;
