# Onboarding

Tramite l'applicazione di onboarding, le PA avranno la possibilità di registrare i propri code hosting su Developers Italia ed indicizzarli nel motore di ricerca.

# Avviare il progetto

Installare le dipendenze
```bash
npm install
```

Avviare l'applicazione con docker

- Modalità sviluppo

Lanciare i seguenti comandi

```bash
docker build -t <imageName> .
docker run -p 80:80 -e env=dev <imageName> 
```

- Modalita' produzione
        
Creare nella cartella principale del progetto un file di nome `account-config.json` basandosi sul template di `account-config-tpl.json`.

Configurare il file `config-prod.json`, specificando i parametri `host` e `applicationHost`.

Lanciare i seguenti comandi

```bash modalita' di produzione
docker build -t <imageName> .
docker run -p 80:80 -e env=pm-prod <imageName> 
```
