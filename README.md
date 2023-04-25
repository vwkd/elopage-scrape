# README

Script to scrape elopage courses



## Features

- Download all lessons of course including inactive lessons
- Save text as single markdown file with nested headers
- Download all linked files like images, videos and documents

Note: The resulting markdown may have imperfections like empty hyperlinks, empty formatting tags, and more. These originate from elopage's HTML likely due to incorrect use of WYSIWYG formatting by the course author.



## Requirements

- elopage course subscription
- elopage course session id, e.g. from start url `https://elopage.com/payer/s/foobar/courses/bazbuz?course_session_id=1234567&lesson_id=7654321`
- elopage access token, e.g. from cookie `p_access_token`
- Deno



## Usage

### Configure

- set environmental variables or create `.env` file

```
COURSE_SESSION_ID="1234567"
ACCESS_TOKEN="eyJhbGciOiJSUzUxMiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.jYW04zLDHfR1v7xdrW3lCGZrMIsVe0vWCfVkN2DRns2c3MN-mcp_-RE6TN9umSBYoNV-mnb31wFf8iun3fB6aDS6m_OXAiURVEKrPFNGlR38JSHUtsFzqTOj-wFrJZN4RwvZnNGSMvK3wzzUriZqmiNLsG8lktlEn6KA4kYVaM61_NpmPHWAjGExWv7cjHYupcjMSmR8uMTwN5UuAwgW6FRstCJEfoxwb0WKiyoaSlDuIiHZJ0cyGhhEmmAPiCwtPAwGeaL1yZMcp0p82cpTQ5Qb-7CtRov3N4DcOHgWYk6LomPR5j5cCkePAz87duqyzSMpCB0mCOuE3CU2VMtGeQ"
USER_AGENT="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36"
DELAY=5000
DELAY_OFFSET=2000
```

### Scrape

```sh
deno task scrape some/folder
```

- scrapes raw content
- arguments: output folder
- options:
  - `-i`, `--inactive`: include inactive (default false)
  - `-v`, `--verbose`: verbose logging (default false)
- note: this might take some time, around `total_count` of lessons times `DELAY` seconds

### Parse

```sh
deno task parse some/folder
```

- parses raw content, downloads linked files, and writes markdown file
- arguments: output folder
- options:
  - `-v`, `--verbose`: verbose logging (default false)
  - `-i`, `--include`: include and download pictures, videos, and/or files, allowed values `pvf` (default `pvf` (all))
  - `-f`, `--force`: force overwriting existing files (default false)
- note: existing files aren't overwritten, i.e. if some downloads fail can simply rerun until has downloaded all
- note: doesn't check if file content was updated, needs to check manually and download again if necessary, e.g. using `-f`
- note: if downloads error with 403 then links in raw content expired, can rerun `scrape` to get fresh raw content and then run `parse` again
