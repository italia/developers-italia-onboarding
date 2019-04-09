read -p "WARNING! This script means downtime! Continue? [y/n]: " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  if [ ! -f smtp-account-config.json ]; then
    echo "You need a file named smtp-account-config.json in this folder"
    exit 1 
  fi
  if [ ! -f config-prod.json ]; then
    echo "You need a file named config-prod.json in this folder"
    exit 1 
  fi
  if [ ! -d private ]; then
    echo "You need a directory named private in this folder"
    exit 1 
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
    -p 8003:80\
    -e env=pm-prod \
    -v /apps/www/onboarding.developers.italia.it/private:/usr/src/app/private:rw \
    -v /apps/www/onboarding.developers.italia.it/smtp-account-config.json:/usr/src/app/smtp-account-config.json \
    -v /apps/www/onboarding.developers.italia.it/config-prod.json:/usr/src/app/config-prod.json \
    -v /data/crawler/indicepa.csv:/usr/src/app/amministrazioni.txt \
      italia/developers-italia-onboarding 
  echo "Starting new container"
  docker start developers-italia-onboarding
  docker ps | grep developers-italia-onboarding
  echo "Done."
fi
