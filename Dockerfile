FROM node:8
ENV env=dev

WORKDIR /usr/src/app/

COPY package.json . 
RUN npm install

# copy app source to destination container
COPY . .

# expose container port
EXPOSE 3000

# Launch application
CMD ["npm","start",${env}]
