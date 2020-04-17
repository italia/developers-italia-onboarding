# Developers Italia Onboarding
![Build Status](https://img.shields.io/circleci/project/github/italia/developers-italia-onboarding/master.svg?style=flat
) ![Issues](https://img.shields.io/github/issues/italia/developers-italia-onboarding.svg) ![License](https://img.shields.io/github/license/italia/developers-italia-onboarding.svg?style=flat)

The onboarding tool allows Italian Public Administrations to register their own code repositories in [Developers Italia](https://innovazione.gov.it/it/progetti/developers-italia/). As such, repositories will be scanned by the [crawler](https://github.com/italia/developers-italia-backend) that will feed the reuse catalog.

## Developers Italia

More informations about Developers Italia can be found on the [website https://innovazione.gov.it](https://innovazione.gov.it/it/progetti/developers-italia/).

## Application flow

* A Public Administration inserts its data into the system. Leveraging the functionality, the fields *ricerca amministrazione*, *Codice iPA*, *Amministrazione* and *PEC* are automatically mapped

* After clicking *Registra*, the application sends a *PEC* to the email address automatically derived from [IndicePA](https://indicepa.gov.it/)

* A link to confirm the registration is included in the email. Clicking on the link, the user is redirected to a confirmation page

* Clicking *Registra* in the confirmation page, Public Administrations get registered in the system

The same Public Administration can register different public, code repositories.

## The private folder and the whitelist.db.json file

The application makes use of a folder named *private/data*, which should contain:

* A private key, used to generate tokens sent during the registration. If no private keys are present while the application starts, a new one is automatically created

* A *whitelist.db.json* database file, with the list of the Public Administrations that have registered. If no database files are present while the application starts, a new one is automatically created

For security reasons, the folder:

* is not committed by default. To run the application, you'll need to create one manually

* is added to the *.gitignore* file of this repository

## whitelist.db.json file format

The *whitelist.db.json* file keeps track of the Public Administrations registered.

When the database is still empty, it may look like this:

```json
{
  "registrati": []
}
```

When some Public Administrations register into the system, it should follow approximately this exemplar format:

```json
{
  "registrati": [
    {
      "referente": "pluto",
      "ipa": "c_a123",
      "url": "https://github.com/undefined",
      "pec": "protocollo.comunemaramao@pec.it"
    },
    {
      "referente": "pluto",
      "ipa": "c_a123",
      "url": "https://gitlab.com/undefined",
      "pec": "protocollo.comunemaramao@pec.it"
    }
  ]
}
```

An exemplar file is available [here](demo-data/whitelist.db.json).

## Get the list of Public Administrations registered through APIs

To retrieve the list of Public Administrations registered, make a GET request against `http://YOUR_HOSTNAME/repo-list`. A similar result should be returned:

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

## Supported code hosting platforms

The application currently supports the following code hosting platforms:

* https://github.com

* https://bitbucket.org

* https://gitlab.com

* https://phabricator.com

* https://gitea.io

* https://gogs.io

Stay tuned. The list keeps growing...

## Development and test environments

A development environment can be either brought up directly on the developer machine or in form of a Docker container.

### Run the application directly on the developer machine (npm/yarn)

Many developers prefer to directly run the application on their own machine, without Docker.

To do so:

* Create a *private/data* folder in the root of the repository

* Run `npm install`

* Serve the content locally on port *3000*, using *nodemon*, running `npm run dev`

### Run the application using Docker

The [docker-compose.yml](docker-compose.yml) file leverages some environment variables that should be declared in an *.env* file, located in the root of this repository. A [.env.example](.env.example) file has some exemplar values. Before proceeding, copy the [.env.example](.env.example) into *.env* and modify the environment variables as needed.

Then, build the container, running:

```shell
docker-compose up [-d] [--build]
```

where:

* *-d* executes the container in background

* *--build* forces the container to re-build

Once the container is up, the content will be served locally, on port *3000*.

To destroy the container, use:

```shell
docker-compose down
```

## License

The project is distributed under BSD-3 license (SPDX code: *BSD-3-Clause*). For more informations, have a look at the [LICENSE file](LICENSE).
