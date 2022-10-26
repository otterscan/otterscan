# syntax=docker/dockerfile-upstream:master-labs
FROM alpine:3.15.0 as logobuilder
RUN apk add imagemagick parallel subversion git zip tar
WORKDIR /
ADD https://github.com/trustwallet/assets.git /trustwallet
RUN mkdir -p /tokens/
RUN mv /trustwallet/blockchains/ethereum/assets/ /tokens/1/
RUN mv /trustwallet/blockchains/polygon/assets/ /tokens/137/
RUN mv /trustwallet/blockchains/smartchain/assets/ /tokens/56/
RUN find . -name logo.png | parallel magick convert {} -filter Lanczos -resize 32x32 {}; exit 0
RUN zip -r /tokens.zip /tokens/*
CMD ["echo","docker run <image> cat /tokens.zip >> tokens.zip"]
