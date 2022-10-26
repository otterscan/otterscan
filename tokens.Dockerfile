# syntax=docker/dockerfile-upstream:master-labs
FROM alpine:3.15.0 as logobuilder
RUN apk add imagemagick parallel subversion git zip tar
WORKDIR /
ADD https://github.com/trustwallet/assets.git /trustwallet
RUN mkdir -p /assets/
RUN mv /trustwallet/blockchains/ethereum/assets /assets/1/
RUN mv /trustwallet/blockchains/polygon/assets /assets/137/
RUN mv /trustwallet/blockchains/smartchain/assets /assets/56/
RUN find . -name logo.png | parallel magick convert {} -filter Lanczos -resize 32x32 {}; exit 0
RUN zip -r /tokens.zip /assets
CMD ["echo","docker run <image> cat /tokens.zip > tokens.zip"]
