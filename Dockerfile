FROM node:lts-alpine

ENV HOME /usr/src/app/
ENV USER developers

WORKDIR ${HOME}

RUN apk add ca-certificates

COPY public public
COPY src src
COPY AUTHORS .
COPY CHANGELOG.md .
COPY LICENSE .
COPY package.json .
COPY package-lock.json .
COPY server.js .

RUN adduser --home ${HOME} --shell /bin/sh --disabled-password ${USER}

RUN chown -R ${USER}.${USER} ${HOME}

RUN npm install

USER ${USER}

CMD npm run prod
