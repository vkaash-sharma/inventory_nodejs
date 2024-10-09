FROM node:22-alpine

WORKDIR /app

COPY package.json ./

COPY ./ ./

ARG APP_ENV=dev

RUN echo ${APP_ENV}

COPY .env.${APP_ENV} ./.env

RUN npm i
RUN npm install pm2 -g
CMD ["pm2-runtime", "start", "/app/bin/www.js"]
