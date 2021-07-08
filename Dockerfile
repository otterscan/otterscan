FROM node:12.22.3-alpine AS builder
WORKDIR /otterscan-build
COPY ["package*.json", "tsconfig.json", "craco.config.js", "tailwind.config.js", "/otterscan-build/"]
COPY ["src", "/otterscan-build/src"]
COPY ["public", "/otterscan-build/public"]
RUN npm install
RUN npm run build

FROM nginx:1.21.1-alpine
# TODO create in build pipeline before docker build
# tar -cvzf 4bytes.tgz -C 4bytes signatures
COPY 4bytes.tgz /tmp
RUN tar -xvzf /tmp/4bytes.tgz -C /usr/share/nginx/html/
# TODO create in build pipeline before docker build
# tar -cvzf trustwallet.tgz -C trustwallet/blockchains/ethereum assets
COPY trustwallet.tgz /tmp
RUN tar -xvzf /tmp/trustwallet.tgz -C /usr/share/nginx/html/
RUN rm /tmp/4bytes.tgz /tmp/trustwallet.tgz
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /otterscan-build/build /usr/share/nginx/html/
