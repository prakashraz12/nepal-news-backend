FROM node:alpine

WORKDIR /usr/src/app

COPY package.json package-lock.json ./

RUN npm install

COPY . .

ARG NODE_ENV=production

ENV NODE_ENV=${NODE_ENV}

RUN npm install --only=production

EXPOSE 8000

CMD ["node", "src/index"]
