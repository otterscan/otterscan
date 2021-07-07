FROM nginx:1.21.1-alpine
COPY 4bytes/signatures /usr/share/nginx/html/signatures/
COPY trustwallet/blockchains/ethereum/assets /usr/share/nginx/html/assets/
COPY nginx.conf /etc/nginx/conf.d/default.conf
