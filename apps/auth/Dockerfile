FROM node:22-alpine AS development

WORKDIR /usr/src/app

COPY package.json ./
COPY yarn.lock ./

RUN yarn install

COPY . .

RUN yarn build

FROM node:22-alpine AS production

WORKDIR /usr/src/app

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

COPY --from=development /usr/src/app/dist ./dist
COPY package.json ./
COPY yarn.lock ./

RUN yarn install --production

CMD ["node", "dist/apps/auth/main.js"]