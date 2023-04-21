export function makeRequest(url, token, user_agent) {
  return fetch(url, {
    "headers": {
      "accept": "application/json, text/plain, */*",
      "accept-encoding": "gzip, deflate, br",
      "accept-language": "de",
      "authorization": token,
      "content-language": "de",
      "origin": "https://elopage.com",
      "referer": "https://elopage.com/",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-site",
      "user-agent": user_agent,
    },
    // "referrer": "https://elopage.com/",
    // "referrerPolicy": "strict-origin-when-cross-origin",
    // "body": null,
    // "method": "GET",
    // "mode": "cors",
    // "credentials": "include"
  });
}
