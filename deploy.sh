read -p "WARNING! This script means downtime! Continue? [y/n]: " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  if [ ! -f smtp-account-config.json ]; then
    echo "Creating smtp-account-config.json file"
    touch smtp-account-config.json
  fi
  # Start pull
  echo "Pulling docker image"
  docker pull italia/developers-italia-onboarding
  echo "Stopping and removing container"
  docker stop developers-italia-onboarding
  docker rm developers-italia-onboarding
  echo "Creating new container from base image"
  docker create --name=developers-italia-onboarding \
    --restart=always \
    -p 8003:3000 \
    -e env=pm-prod \
    -v /apps/www/onboarding.developers.italia.it/smtp-account-config.json:/usr/src/app/smtp-account-config.json \
    -v /apps/www/onboarding.developers.italia.it/config-prod.json:/usr/src/app/config-prod.json \
    -v /data/crawler/indicepa.csv:/usr/src/app/amministrazioni.txt \
      onboarding 
  echo "Starting new container"
  docker start developers-italia-onboarding
  docker ps | grep developers-italia-onboarding
  echo "Done."
fi
