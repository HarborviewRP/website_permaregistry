# Discord Authenticated Applicant Tracking System
This system was built for the ProGamerNetwork community but is free for use by other communities.

## [Live Preview](https://recruit.pgn.plus/)

## .env 
```env
COOKIE_SECRET=cookie_sceret_gt_32_characters
CLIENT_ID=discord_oauth_client_id
CLIENT_SECRET=discord_oauth_client_secret
BOT_TOKEN=discord_bot_token
CRYPT_KEY=long_key
CRYPT_INIT=short_key
DOMAIN=http://localhost:3000
MONGODB_URI=mongouri
MONGODB_DB=mongodbname
SEND_STATUS_DM=false
DISCORD_ID=discord_community_guild_id
STAFF_ROLE_ID=<moderator role>
SUPERADMIN_ROLE=<admin role>
VERIFY_ROLE=<role for verifying membership>
AWS_ACCESS_KEY_ID=aws_access_key_id
AWS_SECRET_ACCESS_KEY=aws_secret_access_key
AWS_REGION=aws-region
AWS_S3_BUCKET_NAME=aws-bucket-name
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

## OAuth Code Credit
[UnusualAbsurd](https://github.com/UnusualAbsurd)
