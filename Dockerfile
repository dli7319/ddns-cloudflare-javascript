FROM node:18

USER node
WORKDIR /home/node

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run compile

CMD ["node", "build/index.js"]