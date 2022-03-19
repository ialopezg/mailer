FROM node:14.10.0-slim

WORKDIR /app

COPY . .

RUN npm install
RUN npm run build

EXPOSE 4000

CMD ["npm", "run", "start:prod"]
