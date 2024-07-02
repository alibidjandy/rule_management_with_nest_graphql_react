FROM node:16.13.1

WORKDIR /app

COPY package.json ./
COPY yarn.lock ./

RUN yarn install

COPY . .

COPY . /usr/src/app
CMD ["yarn", "start:dev"]
