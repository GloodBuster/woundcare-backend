FROM node:21

COPY . /woundcare-backend
WORKDIR /woundcare-backend
RUN npm install
RUN npm run build

ENTRYPOINT ["npm", "run", "start:prod"]

ARG APP_PORT=3000
EXPOSE ${APP_PORT}