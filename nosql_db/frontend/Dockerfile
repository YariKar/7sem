FROM node:22.11-alpine3.20 AS build

WORKDIR /app
COPY package*.json ./

RUN npm install

COPY . .

CMD ["npm", "run", "start"] 
