FROM node:24-bookworm

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN mkdir -p data && npm run build

EXPOSE 3001

CMD ["npm", "run", "start"]
