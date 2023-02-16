FROM node:18.14.0-alpine3.17 AS builder
WORKDIR /otterscan-build
COPY ["package.json", "package-lock.json", "/otterscan-build/"]
RUN npm install
COPY ["run-nginx.sh", "tsconfig.json", "tsconfig.node.json", "postcss.config.js", "tailwind.config.js", "vite.config.ts", "index.html", "/otterscan-build/"]
COPY ["public", "/otterscan-build/public/"]
COPY ["src", "/otterscan-build/src/"]
RUN npm run build

FROM alpine:3.17.2 AS logobuilder
RUN apk add imagemagick parallel
WORKDIR /assets
COPY trustwallet/blockchains/ethereum/assets /assets/1/
COPY trustwallet/blockchains/polygon/assets /assets/137/
COPY trustwallet/blockchains/smartchain/assets /assets/56/
RUN find . -name logo.png | parallel magick convert {} -filter Lanczos -resize 32x32 {}; exit 0

FROM alpine:3.17.2 AS fourbytesbuilder
WORKDIR /signatures
COPY 4bytes/signatures /signatures/
COPY 4bytes/with_parameter_names /signatures/

FROM alpine:3.17.2 AS topic0builder
WORKDIR /topic0
COPY topic0/with_parameter_names /topic0/

FROM alpine:3.17.2 AS chainsbuilder
WORKDIR /chains
COPY chains/_data/chains /chains/

# Add brotli module to official nginx image
# Based on: https://github.com/nginxinc/docker-nginx/tree/master/modules
FROM nginx:1.21.3-alpine as nginxbuilder

RUN set -ex \
    && apk update \
    && apk add linux-headers openssl-dev pcre-dev zlib-dev openssl abuild \
               musl-dev libxslt libxml2-utils make mercurial gcc unzip git \
               xz g++ coreutils \
    # allow abuild as a root user \
    && printf "#!/bin/sh\\nSETFATTR=true /usr/bin/abuild -F \"\$@\"\\n" > /usr/local/bin/abuild \
    && chmod +x /usr/local/bin/abuild \
    && hg clone -r ${NGINX_VERSION}-${PKG_RELEASE} https://hg.nginx.org/pkg-oss/ \
    && cd pkg-oss \
    && mkdir /tmp/packages \
    && for module in "brotli"; do \
        echo "Building $module for nginx-$NGINX_VERSION"; \
        if [ -d /modules/$module ]; then \
            echo "Building $module from user-supplied sources"; \
            # check if module sources file is there and not empty
            if [ ! -s /modules/$module/source ]; then \
                echo "No source file for $module in modules/$module/source, exiting"; \
                exit 1; \
            fi; \
            # some modules require build dependencies
            if [ -f /modules/$module/build-deps ]; then \
                echo "Installing $module build dependencies"; \
                apk update && apk add $(cat /modules/$module/build-deps | xargs); \
            fi; \
            # if a module has a build dependency that is not in a distro, provide a
            # shell script to fetch/build/install those
            # note that shared libraries produced as a result of this script will
            # not be copied from the builder image to the main one so build static
            if [ -x /modules/$module/prebuild ]; then \
                echo "Running prebuild script for $module"; \
                /modules/$module/prebuild; \
            fi; \
            /pkg-oss/build_module.sh -v $NGINX_VERSION -f -y -o /tmp/packages -n $module $(cat /modules/$module/source); \
            BUILT_MODULES="$BUILT_MODULES $(echo $module | tr '[A-Z]' '[a-z]' | tr -d '[/_\-\.\t ]')"; \
        elif make -C /pkg-oss/alpine list | grep -E "^$module\s+\d+" > /dev/null; then \
            echo "Building $module from pkg-oss sources"; \
            cd /pkg-oss/alpine; \
            make abuild-module-$module BASE_VERSION=$NGINX_VERSION NGINX_VERSION=$NGINX_VERSION; \
            apk add $(. ./abuild-module-$module/APKBUILD; echo $makedepends;); \
            make module-$module BASE_VERSION=$NGINX_VERSION NGINX_VERSION=$NGINX_VERSION; \
            find ~/packages -type f -name "*.apk" -exec mv -v {} /tmp/packages/ \;; \
            BUILT_MODULES="$BUILT_MODULES $module"; \
        else \
            echo "Don't know how to build $module module, exiting"; \
            exit 1; \
        fi; \
    done \
    && echo "BUILT_MODULES=\"$BUILT_MODULES\"" > /tmp/packages/modules.env

FROM nginx:1.21.3-alpine
COPY --from=nginxbuilder /tmp/packages /tmp/packages
RUN set -ex \
    && . /tmp/packages/modules.env \
    && for module in $BUILT_MODULES; do \
           apk add --no-cache --allow-untrusted /tmp/packages/nginx-module-${module}-${NGINX_VERSION}*.apk; \
       done \
    && rm -rf /tmp/packages
RUN apk update && apk add jq
COPY --from=chainsbuilder /chains /usr/share/nginx/html/chains/
COPY --from=topic0builder /topic0 /usr/share/nginx/html/topic0/
COPY --from=fourbytesbuilder /signatures /usr/share/nginx/html/signatures/
COPY --from=logobuilder /assets /usr/share/nginx/html/assets/
COPY nginx/conf.d/default.conf /etc/nginx/conf.d/default.conf
COPY nginx/nginx.conf /etc/nginx/nginx.conf
COPY --from=builder /otterscan-build/dist /usr/share/nginx/html/
COPY --from=builder /otterscan-build/run-nginx.sh /
WORKDIR /

CMD ["/run-nginx.sh"]
