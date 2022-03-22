FROM node:14.19.1-slim

RUN npm install --global npm@latest

RUN mkdir -p /var/www/mailer
WORKDIR /var/www/mailer
ADD . /var/www/mailer

RUN npm install

CMD npm run build && npm run start:prod
