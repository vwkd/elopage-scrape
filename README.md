# README

Script to scrape elopage courses



## Features

- Convert whole course to single markdown file
- Download images, videos and files
- Bonus: know about inactive lessons

Note: The resulting markdown may have imperfections like empty hyperlinks, empty formatting tags, and more. These originate from elopage's HTML likely due to incorrect use of WYSIWYG formatting by the course author.



## Requirements

- elopage course subscription
- elopage login cookie `p_access_token` and start url `https://elopage.com/payer/s/foobar/courses/bazbuz?course_session_id=1234567&lesson_id=7654321`
- Deno



## Usage

- set environmental variables or create `.env` file

```
START_URL="https://elopage.com/payer/s/foobar/courses/bazbuz?course_session_id=1234567&lesson_id=7654321"
ACCESS_TOKEN="eyJhbGciOiJSUzUxMiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.jYW04zLDHfR1v7xdrW3lCGZrMIsVe0vWCfVkN2DRns2c3MN-mcp_-RE6TN9umSBYoNV-mnb31wFf8iun3fB6aDS6m_OXAiURVEKrPFNGlR38JSHUtsFzqTOj-wFrJZN4RwvZnNGSMvK3wzzUriZqmiNLsG8lktlEn6KA4kYVaM61_NpmPHWAjGExWv7cjHYupcjMSmR8uMTwN5UuAwgW6FRstCJEfoxwb0WKiyoaSlDuIiHZJ0cyGhhEmmAPiCwtPAwGeaL1yZMcp0p82cpTQ5Qb-7CtRov3N4DcOHgWYk6LomPR5j5cCkePAz87duqyzSMpCB0mCOuE3CU2VMtGeQ"
USER_AGENT="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36"
DELAY=5000
DELAY_OFFSET=2000
```

- scrape

```sh
deno task scrape
```

- parse

```sh
deno task parse
```
