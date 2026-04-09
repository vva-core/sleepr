FROM node:22-alpine AS development

WORKDIR /usr/src/app

COPY package.json ./
COPY yarn.lock ./
COPY tsconfig.json tsconfig.json
COPY nest-cli.json nest-cli.json
COPY apps/reservations/package.json apps/reservations/package.json
COPY prisma ./prisma

COPY apps/reservations apps/reservations
COPY libs libs

RUN yarn install
RUN cd apps/reservations && yarn install

RUN npx prisma generate
RUN yarn build reservations

FROM node:22-alpine AS production

WORKDIR /usr/src/app

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

COPY --from=development /usr/src/app/dist ./dist
COPY package.json ./
COPY yarn.lock ./
COPY apps/reservations/package.json ./apps/reservations/package.json

COPY --from=development /usr/src/app/dist ./dist
COPY --from=development /usr/src/app/node_modules ./node_modules
COPY --from=development /usr/src/app/apps/reservations/node_modules ./apps/reservations/node_modules

CMD ["node", "dist/apps/reservations/main.js"]