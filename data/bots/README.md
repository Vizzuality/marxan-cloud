# Marxan API bots

This folder contains friendly bots for the Marxan API.

They take care of automating things.

## Running

1. Install deno if not already installed

`curl -fsSL https://deno.land/x/install/install.sh | sh`

2. Configure the bot(s) you wish to run: this is done via an `.env` file in the
   bot's directory

```
API_URL=<base URL of the API instance>
USERNAME=<username to authenticate as>
PASSWORD=<password>
POSTGRES_URL=<only needed if the bot inserts data via PostgreSQL>
```

Individual demo bots (`demo-brazil` and `demo-australia`) are currently
expecting the user whose credentials are configured in `.env` to already exist
in the API instance configured, when run individually.

The `core-demos` bot needs the same `.env` file, but it will first create a new
user with the credentials configured, then run the Brazil and Australia demo
bots using a JWT for the newly created user.

3. Run bot

`OPTIC_MIN_LEVEL=Info deno run --allow-read --allow-net --allow-env ./bot.ts`

For a cleaner output (just errors) set `OPTIC_MIN_LEVEL=Error`; to see debug
output (mostly `inspect` of data from API responses), set
`OPTIC_MIN_LEVEL=Debug`.

## Developing on bots

Things are quite in flux right now, but in general

* `libbot` is where new bot functionality should be added, via classes that take
  care of a single domain of the platform.
* `libbot/scenario-status` currently handles waiting for scenario status changes
  for all kinds of async operations; it may be advisable to split the
  operation-specific waiting code to individual modules if the current module
  grows further
* do not forget to run `deno fmt` before committing new code

## Compiling bots

If wanting to run bots somewhere without having to copy over the source tree,
or if it is not possible or practical to install the Deno runtime, bots can
be compiled to a single binary via `deno compile`.
