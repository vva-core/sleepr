FROM node:22-alpine AS development

WORKDIR /usr/src/app

COPY package.json ./
COPY yarn.lock ./
COPY tsconfig.json tsconfig.json
COPY nest-cli.json nest-cli.json
COPY apps/auth/package.json apps/auth/package.json

COPY apps/auth apps/auth
COPY libs libs

RUN yarn install
RUN cd apps/auth && yarn install

RUN yarn build auth

FROM node:22-alpine AS production

WORKDIR /usr/src/app

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

COPY --from=development /usr/src/app/dist ./dist
COPY --from=development /usr/src/app/node_modules ./node_modules
COPY --from=development /usr/src/app/apps/auth/node_modules ./apps/auth/node_modules

CMD ["node", "dist/apps/auth/main.js"]