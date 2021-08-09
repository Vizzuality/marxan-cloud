# Marxan API bots

This folder contains friendly bots for the Marxan API.

They take care of automating things.

How to run them:
1.- Install deno if not already installed:
`curl -fsSL https://deno.land/x/install/install.sh | sh`
create a .env file with the next info:
```
API_URL=http://localhost:3030
USERNAME=
PASSWORD=
POSTGRES_URL=
```

2.- Run demo cases:
`deno run --allow-all bot.ts`

3.- Compile demo cases:
`deno compile `