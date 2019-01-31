# Onboarding

Tramite l'applicazione di onboarding, le PA avranno la possibilità di
registrare i propri repository di code hosting sul portale `Developers Italia`.
In questo modo sarà possibile aggiungere il repository alla lista indicizzata
dal *crawler* del portale che popolerà il catalogo del riuso. 

# Avvio del progetto 

## Modalità di sviluppo (dev)

Per sviluppare in locale è necessario innanzitutto clonare o scaricare il
repository in una cartella locale. 
Per far ciò, eseguire il comando `git clone` seguito dalla URL più appropriata.

### Locale (npm/yarn)

Dopodichè, sarà necessario installare le dipendenze del progetto tramite:
```bash
npm install
```
A questo punto sarà possibile eseguire il server tramite il comando:
```bash
npm dev
```
Questo comando creerà un server di development esposto sulla port 80 di
localhost attraverso `nodemon`, che quindi esegue il reload in automatico ad
ogni cambiamento dei file, permettendo di testare i cambiamenti in fase di
sviluppo. 

### Docker

E' possibile avviare l'applicazione anche attraverso docker.
Per far ciò, è necessario lanciare i seguenti comandi:

```bash
docker build -t <imageName> .
docker run -p 80:80 -e env=dev <imageName> 
```

## Modalita' di produzione (prod)

Per configurare il software in modalità di produzione è necessario specificare
dei parametri quali, ad esempio, gli host SMTP, gli host applicativi etc. 

### SMTP
Innanzitutto, siccome l'applicativo prevede l'invio di *Posta Elettronica
Certificata*, è necessario configurare un server SMTP.
Questa fase di configurazione prevede di modificare due file di progetto.
Il primo è il file denominato `config-prod.json` che contiene le seguenti
informazioni:
```json
{
    "host": "",
    "port": 587,
    "secure": true,
    "applicationHost": "",
    "applicationPort": 80
}
```
dove `host` e `port` rappresentano le informazioni del server SMTP. 
Per specificare le credenziali, invece, è necessario modificare un secondo
file. Per far ciò, copiare il file denominato
`smtp-account-config.json.example`, inserire le informazioni relative al
proprio `user` e `password`, e salvarlo come `smtp-account-config.json`.
In questo modo l'applicativo avrà le informazioni per connettersi al server
SMTP ed inviare i messaggi di PEC.

A questo punto è possibile creare l'immagine docker e avviarla.
Per far ciò, lanciare i seguenti comandi:

```bash 
docker build -t <imageName> .
docker run -p 80:80 -e env=pm-prod <imageName> 
```

# Percorsi
Le PA registrate vengono salvate all'interno del file
`private/whitelist.db.json`. 
Per invocare la API che restituisce la lista delle PA registrate, usare
la URL `http://localhost/repo-list`.

# LICENSE
Questo progetto è coperto da una licenza di tipo BSD 3-Clause License (codice
SPDX: `BSD-3-Clause`). Per maggiori informazioni a riguardo consultare il file
denominato [`LICENSE`](LICENSE).
