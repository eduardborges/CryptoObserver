FROM node:current-alpine

# Create app directory
WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci

ADD . /usr/src/app
RUN npm run build

CMD ["npm", "start" ]