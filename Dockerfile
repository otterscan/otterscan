FROM node:14.17.3-alpine3.14 AS builder
RUN npm i -g npm@7.19.1
WORKDIR /otterscan-build
COPY ["package.json", "package-lock.json", "/otterscan-build/"]
RUN npm install
COPY ["run-nginx.sh", "tsconfig.json", "craco.config.js", "tailwind.config.js", "/otterscan-build/"]
COPY ["public", "/otterscan-build/public/"]
COPY ["src", "/otterscan-build/src/"]
RUN npm run build

FROM alpine:3.14.0 AS logobuilder
RUN apk add imagemagick parallel
WORKDIR /assets
COPY trustwallet/blockchains/ethereum/assets /assets/
RUN find . -name logo.png | parallel magick convert {} -filter Lanczos -resize 32x32 {}

FROM alpine:3.14.0 AS fourbytesbuilder
WORKDIR /signatures
COPY 4bytes/signatures /signatures/
COPY 4bytes/with_parameter_names /signatures/

FROM alpine:3.14.0 AS topic0builder
WORKDIR /topic0
COPY topic0/with_parameter_names /topic0/

FROM nginx:1.21.1-alpine
RUN apk add jq
COPY --from=topic0builder /topic0 /usr/share/nginx/html/topic0/
COPY --from=fourbytesbuilder /signatures /usr/share/nginx/html/signatures/
COPY --from=logobuilder /assets /usr/share/nginx/html/assets/
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /otterscan-build/build /usr/share/nginx/html/
COPY --from=builder /otterscan-build/run-nginx.sh /
WORKDIR /

CMD ["/run-nginx.sh"]
