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
docker run -p 3000:3000 -e env=dev <imageName> 
```

- Modalita' produzione
        
Lanciare i seguenti comandi

```bash modalita' di produzione
docker build -t <imageName> .
docker run -p 80:3000 -e env=pm-prod <imageName> 
```
