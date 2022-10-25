# syntax=docker/dockerfile-upstream:master-labs
FROM node:16.16.0-alpine3.15 AS builder

RUN apk add git subversion rsync
WORKDIR /otterscan-build
COPY ["package.json", "package-lock.json", "/otterscan-build/"]
RUN npm install
COPY ["tsconfig.json", "tsconfig.node.json", "postcss.config.js", "tailwind.config.js", "vite.config.ts", "index.html", "/otterscan-build/"]
COPY ["public", "/otterscan-build/public/"]
COPY ["src", "/otterscan-build/src/"]
RUN npm run fullbuild

FROM alpine:3.15.0 AS logobuilder
RUN apk add imagemagick parallel subversion git
WORKDIR /
ADD https://github.com/trustwallet/assets.git /trustwallet
RUN mkdir -p /assets/
RUN mv /trustwallet/blockchains/ethereum/assets /assets/1/
RUN mv /trustwallet/blockchains/polygon/assets /assets/137/
RUN mv /trustwallet/blockchains/smartchain/assets /assets/56/
RUN find . -name logo.png | parallel magick convert {} -filter Lanczos -resize 32x32 {}; exit 0

# Add brotli module to official nginx image
# Based on: https://github.com/nginxinc/docker-nginx/tree/master/modules
FROM golang:1.19-alpine as gobuilder
RUN apk add alpine-sdk

WORKDIR /wd
COPY ["go.mod","go.sum","/wd/"]
COPY cmd cmd
RUN go build -o rpcdaemon ./cmd/rpcdaemon
RUN go build -o server ./cmd/server

FROM alpine:3.15.0
RUN apk add alpine-sdk
WORKDIR /wd
COPY --from=gobuilder /wd/rpcdaemon /usr/bin/rpcdaemon
COPY --from=gobuilder /wd/server /usr/bin/server
COPY --from=builder /otterscan-build/dist /wd/dist
COPY --from=logobuilder /assets /wd/dist

CMD ["server"]
