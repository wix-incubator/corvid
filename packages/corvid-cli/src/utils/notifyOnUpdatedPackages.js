const updateNotifier = require("update-notifier");
const cliPackageJson = require("../../package.json");

const notify = () => {
  updateNotifier({ pkg: cliPackageJson }).notify({ defer: false });

  try {
    const typesPackageJson = require("corvid-types/package.json");
    updateNotifier({
      pkg: typesPackageJson
    }).notify({ defer: false });
  } catch (e) {
    // not using corvid-types
  }
};

module.exports = notify;
