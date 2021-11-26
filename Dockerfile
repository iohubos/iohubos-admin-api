FROM node:15.11.0-alpine3.10

WORKDIR /usr/iohubos-admin-api

COPY .  .
RUN npm install
RUN npm run build

FROM node:15.11.0-alpine3.10

WORKDIR /usr/iohubos-admin-api

COPY --from=0 /usr/iohubos-admin-api/package.json ./
COPY --from=0 /usr/iohubos-admin-api/node_modules ./node_modules/
COPY --from=0 /usr/iohubos-admin-api/dist ./dist/

CMD ["npm", "run", "startNoBuild"]
