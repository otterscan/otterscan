FROM node:12.22.3-alpine AS builder
WORKDIR /otterscan-build
COPY ["package.json", "package-lock.json", "/otterscan-build"]
RUN npm install
COPY ["run-nginx.sh", "tsconfig.json", "craco.config.js", "tailwind.config.js", "/otterscan-build"]
COPY ["public", "/otterscan-build/public"]
COPY ["src", "/otterscan-build/src"]
RUN npm run build

FROM nginx:1.21.1-alpine
RUN apk add jq
COPY 4bytes/signatures /usr/share/nginx/html/signatures/
COPY trustwallet/blockchains/ethereum/assets /usr/share/nginx/html/assets/
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /otterscan-build/build /usr/share/nginx/html/
COPY --from=builder /otterscan-build/run-nginx.sh /
WORKDIR /

CMD ["/run-nginx.sh"]
