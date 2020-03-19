FROM node:10.16.0

WORKDIR /

COPY ./server.js ./
COPY ./package.json ./
COPY ./config ./config
COPY ./controllers ./controllers
COPY ./routes ./routes
COPY ./package.json ./
COPY ./package-lock.json ./
RUN npm install


ENTRYPOINT [ "node", "server.js" ]
EXPOSE 8080
