 <!-- markdownlint-disable no-inline-html -->

# Overview

<div align="center">
  <h3>
    <a href="https://onboarding.developers.italia.it">
      https://onboarding.developers.italia.it
    </a>
  </h3>

  <img alt="Issues" src="https://img.shields.io/github/issues/italia/developers-italia-onboarding.svg" />
  <img alt="License" src="https://img.shields.io/github/license/italia/developers-italia-onboarding.svg?style=flat" />
</div>

The onboarding tool is a [hapi](https://github.com/hapijs/hapi) web application that
allows Italian Public Administrations to register their code repositories in
[Developers Italia](https://innovazione.gov.it/it/progetti/developers-italia/).

The repositories are scanned by the
[crawler](https://github.com/italia/developers-italia-backend) that feeds the
[reuse catalog](https://developers.italia.it/en/search).

## Application flow

* A Public Administration inserts its data into the system.

* After clicking *Registra*, the application sends a confirmation [PEC](https://en.wikipedia.org/wiki/Certified_email)
  to the address from [IndicePA](https://indicepa.gov.it/)

* The Public Administration confirms the registration clicking on the link from
  the PEC.

A single Public Administration can register multiple code repositories.

## The private folder and the whitelist.db.json file

The application uses of a directory named `private/data`, which should contain:

* A private key, used to generate tokens sent during the registration.
  If no private keys are present while the application starts, a new one
  is automatically created

* `whitelist.db.json`, with the list of the registered Public Administrations.
  If no database file is present while the application starts, a new one is
  automatically created.

For security reasons, that directory:

* is not committed by default. To run the application, you'll need to create
  one manually

* is added to the `.gitignore` file of this repository

### whitelist.db.json file format

The format of `whitelist.db.json` is:

```json
{
  "registrati": [
    {
      "referente": "John Smith",
      "ipa": "c_a123",
      "url": "https://github.com/undefined",
      "pec": "protocollo.comunemaramao@pec.it"
    },
    {
      "referente": "Mario Rossi",
      "ipa": "c_a123",
      "url": "https://gitlab.com/undefined",
      "pec": "protocollo.comunemaramao@pec.it"
    }
  ]
}
```

An example file is available [here](demo-data/whitelist.db.json).

## Get the list of Public Administrations registered through APIs

`GET https://onboarding.developers.italia.it/repo-list` returns the list
of currently registered Public Administrations, in YAML form:

```yaml
---

registrati:
  -
    timestamp: "2019-05-27T09:45:00.770Z"
    ipa: "c_a123"
    url: "https://github.com/undefined"
    pec: "protocollo.comunemaramao@pec.it"
  -
    timestamp: "2019-05-28T09:45:00.770Z"
    ipa: "c_a123"
    url: "https://gitlab.com/undefined"
    pec: "protocollo.comunemaramao@pec.it"
```

## Development

### Run the application directly on the developer machine

1. `mkdir private/data`

2. `npm install`

3. `npm run dev`

The server will listen to `http://localhost:3000`.

### Run the application using Docker

1. Copy the [`.env.example`](.env.example) file into `.env` and edit the
   environment variables as it suits you.

   ```shell
   cp .env.example .env
   ```

2. Build the container:

   ```shell
   docker-compose up
   ```

Once the container is up, the content will be served at `http://localhost:3000`

## License

The project is distributed under BSD-3 license (SPDX code: *BSD-3-Clause*). For
more information, have a look at the [LICENSE file](LICENSE).
