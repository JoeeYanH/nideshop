FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install && npm cache clean --force

COPY . .
RUN npm run compile

EXPOSE 8360

CMD ["node", "production.js"]
