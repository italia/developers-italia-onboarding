# Onboarding

Tramite l'applicazione di onboarding, le PA avranno la possibilità di registrare i propri code hosting su Developers Italia ed indicizzarli nel motore di ricerca.

# Avviare il progetto

Installare le dipendenze
```bash
npm install
```

Avviare l'applicazione
- modalita' sviluppo
```bash
npm run dev
```
- modalita' produzione

Creare nella cartella principale del progetto un file di nome `account-config-tpl.json` basandosi sul template di `account-config.json`.

Configurare il file `config-prod.json`.

Lanciare poi il comando
```bash modalita' di produzione
npm run prod
```