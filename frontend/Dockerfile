# celx-atendimento - Frontend Dockerfile

FROM node:20-alpine

WORKDIR /app

# Dependências
COPY package*.json ./
RUN npm ci

# Code
COPY . .

# Build
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
