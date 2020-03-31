const fetch = require("node-fetch");

const fetchTestUserCookies = () =>
  fetch("https://apps.wix.com/_api/sled-api/users/login", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.SLED_API_TOKEN}`
    },
    body: JSON.stringify({ userEmail: "corvidtest@gmail.com" })
  })
    .then(response => {
      return response.json();
    })
    .then(data => {
      return [
        ...data.cookies.map(cookie => ({
          url: "http://wix.com",
          name: cookie.name,
          value: cookie.value,
          domain: cookie.domain,
          path: cookie.path,
          isSecure: cookie.secure,
          httpOnly: cookie.isHttpOnly,
          expirationDate: cookie.expires || Date.now() + 60 * 60 * 1000
        }))
      ];
    });

module.exports = fetchTestUserCookies;
