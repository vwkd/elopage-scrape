# README

Script to scrape elopage courses



## Features

- Convert whole course to single markdown file
- Download images, videos and files
- Bonus: know about inactive lessons

Note: The resulting markdown may have imperfections like empty hyperlinks, empty formatting tags, and more. These originate from elopage's HTML likely due to incorrect use of WYSIWYG formatting by the course author.



## Requirements

- elopage login credentials and course subscription
- Deno and Node



## Usage

- install dependencies

```sh
npm install
```

- set environmental variables or create `.env` file

```
USERNAME=foo@bar.com
PASSWORD=foobar
START_URL="https://elopage.com/payer/s/foo/courses/bar"
USER_AGENT="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36"
VIEWPORT_WIDTH=1200
VIEWPORT_HEIGHT=800
DELAY=5000
DELAY_OFFSET=2000
```

- scrape

```sh
npm run scrape
```

- parse

```sh
deno task parse
```
