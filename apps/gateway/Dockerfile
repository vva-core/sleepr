FROM node:22-alpine AS development

WORKDIR /usr/src/app

COPY package.json ./
COPY yarn.lock ./
COPY tsconfig.json tsconfig.json
COPY nest-cli.json nest-cli.json
COPY apps/gateway/package.json apps/gateway/package.json

COPY apps/gateway apps/gateway
COPY libs libs

RUN yarn install
RUN cd apps/gateway && yarn install

RUN yarn build gateway

FROM node:22-alpine AS production

WORKDIR /usr/src/app

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

COPY --from=development /usr/src/app/dist ./dist
COPY --from=development /usr/src/app/node_modules ./node_modules
COPY --from=development /usr/src/app/apps/gateway/node_modules ./apps/gateway/node_modules

COPY proto proto

CMD ["node", "dist/apps/gateway/main.js"]
