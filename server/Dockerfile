FROM node:22-alpine

ENV NODE_ENV=production

WORKDIR /usr/src/app

COPY package.json package-lock.json ./

RUN npm install --only=production

COPY prisma ./prisma

RUN npx prisma generate

COPY . .

EXPOSE 8080

CMD ["npm", "start"]