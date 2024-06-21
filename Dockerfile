FROM --platform=linux/amd64 node:20.10.0-alpine3.17 AS builder
WORKDIR /otterscan-build
COPY --link ["package.json", "package-lock.json", "/otterscan-build/"]
RUN npm ci
COPY --link ["run-nginx.sh", "tsconfig.json", "tsconfig.node.json", "postcss.config.js", "tailwind.config.js", "vite.config.ts", "index.html", "/otterscan-build/"]
COPY --link ["public", "/otterscan-build/public/"]
COPY --link ["src", "/otterscan-build/src/"]
RUN npm run build

# Add brotli module to official nginx image
# Based on: https://github.com/nginxinc/docker-nginx/tree/master/modules
FROM nginx:1.21.3-alpine AS nginxbuilder

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
WORKDIR /usr/share/nginx/html/
COPY --link --from=otterscan/otterscan-assets:v1.1.1 /usr/share/nginx/html/chains chains/
COPY --link --from=otterscan/otterscan-assets:v1.1.1 /usr/share/nginx/html/topic0 topic0/
COPY --link --from=otterscan/otterscan-assets:v1.1.1 /usr/share/nginx/html/assets assets/
COPY --link --from=otterscan/otterscan-assets:v1.1.1 /usr/share/nginx/html/signatures signatures/
COPY --link nginx/conf.d/default.conf /etc/nginx/conf.d/default.conf
COPY --link nginx/nginx.conf /etc/nginx/nginx.conf
COPY --link --from=builder /otterscan-build/dist /usr/share/nginx/html/
COPY --link --from=builder /otterscan-build/run-nginx.sh /
WORKDIR /

CMD ["/run-nginx.sh"]
