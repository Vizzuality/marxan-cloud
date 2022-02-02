# Access Control

The Marxan Cloud platform protects user and project/scenario data via Role-Based
Access Control (RBAC), through the application modules detailed below, which in
turn rely on proven mainstream free software/open source modules for sensitive
and complex tasks such as password encryption and verification, and for signing
and verifying authorization tokens.

- **User management** (signing up for an account, updating one's own account)

Modules used: [bcrypt](https://www.npmjs.com/package/bcrypt) for password
hashing and verification.

- **Authentication** (signing in to the platform)

Modules used: [PassportJS Local
Strategy](https://www.npmjs.com/package/passport-local), via the [NestJS
Passport module](https://www.npmjs.com/package/@nestjs/passport);
[jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken), via the [NestJS JWT
module](https://www.npmjs.com/package/@nestjs/jwt).

- **Authorization** (management of user roles and their permissions on projects
  and scenarios)

Modules used: [PassportJS JWT
Strategy](https://www.npmjs.com/package/passport-jwt), via the [NestJS JWT
module](https://www.npmjs.com/package/@nestjs/jwt].

## User management

User data is stored in the application's own PostgreSQL database.

The Users module enables users to sign up by providing:

- A "display name"

This can be set by each user as they wish.

- An email address (which is used as username)

This is "verified" before the user can log in: once they sign up for an account,
users receive a message on the email address they provided, with a link that
they need to follow in order to complete the email verification process, which
then results in the account being activated. Users cannot sign in until they
have completed this initial email verification step.

Additionally, users are asked to verify their email address every time they
update this in their user profile.

- A password

User passwords are stored as salted (generated salt with ten rounds) hashes
using the `bcrypt` password hashing function.

Users who are in possession of a valid JWT token can update their own account's
password.

No password entropy is enforced on passwords that users choose.

## Authentication

Once a user account has been activated, the user can sign in to the Marxan Cloud
platform (or its API, if using the API directly) via an authentication endpoint,
which accepts a payload that includes the username (verified email address) and
password. The PassportJS Local strategy is used to authenticate users.

All Marxan Cloud instances should be set up with TLS termination on the reverse
proxies for both the frontend app and the backend API: in this setup, user
credentials for authentication will be encrypted in transit.

With default settings, HTTP traffic between reverse proxies and the backend API
will be unencrypted, so it is fundamental to ensure that the cloud networks
between reverse proxies and API instances are fully private, with no adversarial
access.

If the credentials supplied match those stored in the instance's database, the
user will be successfully authenticated and the API response will include a JSON
Web Token (JWT) that will be used by the frontend app for all the successive API
requests, via the HTTP `Authentication` header, as a `Bearer` token.

Likewise, users who access the API directly will need to use API-issued JWTs
in each request their client sends to the API.

With default settings, JWTs expire 7200 seconds (2 hours) after their `IssuedAt`
time. The frontend app will automatically attempt to obtain a new fresh JWT
before the current one expires, if the user is actively using the application.
All tokens have the same validity (7200 seconds).

The validity timespan of tokens can be configured for each instance, if
necessary.

Users who are in possession of a valid JWT token can forcibly sign themselves
out of all their sessions. This is done by removing all the session ids for the
user, resulting in them being signed out from all the devices/browsers/API
clients they may have been using.

## Authorization

Access control strategies, roles and role management are described in detail in
the [Role-Based Access Control -
Brief](./features/role-based-access-control/brief.md) document within this
repository, and the associated [high-level
design](./features/role-based-access-control/high-level-design.md) document,
which includes a diagram of the access control flow.
