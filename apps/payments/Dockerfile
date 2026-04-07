FROM node:22-alpine AS development

WORKDIR /usr/src/app

COPY package.json ./
COPY yarn.lock ./
COPY tsconfig.json tsconfig.json
COPY nest-cli.json nest-cli.json
COPY apps/payments/package.json apps/payments/package.json

COPY apps/payments apps/payments
COPY libs libs

RUN yarn install
RUN cd apps/payments && yarn install

RUN yarn build payments

FROM node:22-alpine AS production

WORKDIR /usr/src/app

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

COPY --from=development /usr/src/app/dist ./dist
COPY package.json ./
COPY yarn.lock ./
COPY apps/payments/package.json ./apps/payments/package.json

RUN yarn install --production
RUN cd apps/payments && yarn install --production

CMD ["node", "dist/apps/payments/main.js"]