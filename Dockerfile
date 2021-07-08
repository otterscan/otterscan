FROM node:12.22.3-alpine AS builder

ARG VERSION_TAG
ARG REACT_APP_ERIGON_URL

WORKDIR /otterscan-build
RUN apk add git
RUN git clone --recurse-submodules https://github.com/wmitsuda/otterscan.git /otterscan-build
RUN git checkout $VERSION_TAG

RUN npm install
RUN npm run build

FROM nginx:1.21.1-alpine
COPY --from=builder /otterscan-build/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /otterscan-build/build /usr/share/nginx/html/
COPY --from=builder /otterscan-build/4bytes/signatures /usr/share/nginx/html/signatures
COPY --from=builder /otterscan-build/trustwallet/blockchains/ethereum/assets /usr/share/nginx/html/assets
