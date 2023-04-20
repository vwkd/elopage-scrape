# README

Script to scrape elopage courses



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

- run

```sh
npm run scrape
```
