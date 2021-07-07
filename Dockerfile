FROM node:12.22.3-alpine AS builder
WORKDIR /otterscan-build
COPY ["package*.json", "tsconfig.json", "craco.config.js", "tailwind.config.js", "/otterscan-build"]
COPY ["src", "/otterscan-build/src"]
COPY ["public", "/otterscan-build/public"]
RUN npm install
RUN npm run build

FROM nginx:1.21.1-alpine
COPY 4bytes/signatures /usr/share/nginx/html/signatures/
COPY trustwallet/blockchains/ethereum/assets /usr/share/nginx/html/assets/
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /otterscan-build/build /usr/share/nginx/html/
