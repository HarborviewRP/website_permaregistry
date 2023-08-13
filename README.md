# Discord Authenticated Perma Death Registry
This system was built for the Harborview Roleplay community but is free for use by other communities. (if you can get it to work w/ yours :) )

## [Live Preview](https://registry.harborview.io/)

## .env 
```env
COOKIE_SECRET=cookie_secret_thats_32_or_more_chars
CLIENT_ID=discord_client_id
CLIENT_SECRET=discord_client_secret
BOT_TOKEN=discord_bot_token
CRYPT_KEY=see_readme
CRYPT_INIT=see_readme
DOMAIN=http://localhost:3000
MONGODB_URI=mongo_uri
MONGODB_DB=mongo_db
SEND_STATUS_DM=true
DISCORD_ID=discord_server_id
ALLOWED_ROLE=1123133532999528469
SUPER_ADMINS=["359098534307299329"]
INFRA_URL=internal_server_url
INFRA_SCERET=internal_server_webhook
```

## Generating `CRYPT_KEYS` = 
```js
node -p "[ 32, 16 ].map(n => crypto.randomBytes(n).toString('base64'))"
```

## Cookie Secret ( At leat **32** characters long. ) <br />
#### [1password.com](https://1password.com/password-generator/)

## AWS Guide
[Connecting AWS S3 Buckets to NextJS](https://selectfrom.dev/connecting-aws-s3-buckets-to-next-js-25e903621c70)

## Written By  
[ZachyFoxx](https://github.com/zachyfoxx)
(This was originally a recruitment website for PGN that I made, it has been repurposed ;) )

## OAuth Code Credit
[UnusualAbsurd](https://github.com/UnusualAbsurd)
