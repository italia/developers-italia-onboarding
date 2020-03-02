# Developers Italia Onboarding
![Build Status](https://img.shields.io/circleci/project/github/italia/developers-italia-onboarding/master.svg?style=flat
) ![Issues](https://img.shields.io/github/issues/italia/developers-italia-onboarding.svg) ![License](https://img.shields.io/github/license/italia/developers-italia-onboarding.svg?style=flat)

Tramite l'applicazione di onboarding, le PA possono registrare i propri repository di code hosting sul portale [Developers Italia](https://innovazione.gov.it/it/progetti/developers-italia/). In questo modo è possibile aggiungere il repository alla lista indicizzata dal *crawler* del portale, che popolerà il catalogo del riuso. 

## Developers Italia

Ulteriori informazioni relative al progetto Developers Italia possono essere trovate sul sito del [https://innovazione.gov.it](https://innovazione.gov.it/it/progetti/developers-italia/).

## Flow applicativo

* Inserimento da parte della PA dei dati relativi all'organizzazione. Utilizzando la funzionalità di *ricerca amministrazione* i dati sono
automaticamente inseriti nei campi *Codice iPA, Amministrazione e PEC*. 

* Dopo aver selezionato il pulsante *Registra*, l'applicativo invia una PEC all'indirizzo email dell'amministrazione indicato nel form. 

* All'interno della email inviata è presente un link per confermare la registrazione. Cliccando sul link si viene rediretti a una pagina di conferma. 

* Selezionando *Registra* nella pagina di conferma l'amministrazione è registrata nel sistema.

Come si può notare, la stessa PA può registrare diversi URL per repository di codice pubblico.

## La cartella private e il file whitelist.db.json

L'applicazione fa uso di una cartella locale denominata *private/data* che deve contenere:

* Una chiave privata per generare i token inviati per email alle PA al momento della registrazione (autogenerata dal sotware, una volta eseguito)

* Un file di database *whitelist.db.json*, che conterrà l'elenco delle PA registrate (può essere vuoto al primo avvio dell'applicazione)

Per ragioni di sicurezza, la cartella:

* Non è commitata di default. Se si vuole procedere con l'esecuzione locale sarà necessario crearla nella root del repostiory, una volta scaricato

* È aggiuta al .gitignore di questo repository

## Formato whitelist.db.json

Come accennato nel paragrafo precedente, le PA registrate sono salvate in un file locale JSON *whitelist.db.json*. Il file ha la seguente struttura.

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

Un file di esempio è disponibile [qui](demo-data/whitelist.db.json).

## API - lista PA registrate

Per invocare la API che restituiscono la lista delle PA registrate, usare la URL `http://localhost/repo-list`. Il formato ritornato è il seguente:

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

## Repository supportati

Al momento i seguenti repository sono supportati:

* https://github.com

* https://bitbucket.org

* https://gitlab.com

* https://phabricator.com

* https://gitea.io

* https://gogs.io

La lista è in continua evoluzione.

## Ambiente di sviluppo e debug

L'applicativo può essere eseguito in locale, sia direttamente, sulla macchina locale dello sviluppatore, sia attraverso container Docker.

A prescindere dalla metodologia desiderata, è necessario clonare il repository in una cartella locale.

Copiare il file [.env.example](.env.example) in un file *.env*. Modificare le variabili d'ambiente come desiderato.

### Esecuzione diretta sulla macchina dello sviluppatore (npm/yarn)

Per eseguire l'applicativo direttamente sulla macchina dello sviluppatore, installare le dipendenze. Eseguire quindi dalla cartella clonata il seguente comando:

```bash
npm install
```

Esportare le variabili d'ambiente, partendo dal file *.env* creato in precedenza, attraverso il seguente comando:

```bash
export $(grep -v '^#' .env | xargs)
```

Nella root del repository, creare una cartella *private/data*. Al suo interno creare un file vuoto *whitelist.db.json* (o in alternativa copiarlo da [demo-data/whitelist.db.json]).

A questo punto sarà possibile eseguire il server tramite il comando:

```bash
npm run dev
```

Questo comando crea un server di sviluppo locale esposto localhost attraverso *nodemon*, che quindi esegue il reload in automatico ad ogni cambiamento dei file, permettendo di testare i cambiamenti in fase di sviluppo. È ora possibile accedere alla UI in un browser, all'indirizzo *localhost:3000*.

### Docker

L'applicativo è distribuito e consumato in produzione come immagine Docker. Per comodità, oltre a un *Dockerfile*, è stato anche aggiunto un file *docker-compose.yaml*.

Docker-compose si occupa anche di montare il file [whitelist.db.json](demo-data/whitelist.db.json) nel container in *private/data/*.

Per creare e avviare il container, eseguire:

```bash
docker-compose up [-d] [--build]
```

Dove:

* *-d* esegue il container in background

* *--build* forza la build del container

Per distruggere il container usare:

```
docker-compose down
```

# License

Questo progetto è coperto da una licenza di tipo BSD 3-Clause License (codice
SPDX: `BSD-3-Clause`). Per maggiori informazioni a riguardo consultare il file
denominato [`LICENSE`](LICENSE).
