FROM golang:1.19-alpine as gobuilder
RUN apk add alpine-sdk
WORKDIR /wd
COPY ["go.mod","go.sum","/wd/"]
COPY lib lib
COPY cmd cmd
RUN go build -o otter ./cmd/otter

FROM node:18.16.0-alpine3.17 AS builder
RUN apk add git subversion rsync
WORKDIR /otterscan-build
COPY ["package.json", "package-lock.json", "/otterscan-build/"]
RUN npm ci
COPY ["tsconfig.json", "tsconfig.node.json", "postcss.config.js", "tailwind.config.js", "vite.config.ts", "index.html", "/otterscan-build/"]
COPY ["public", "/otterscan-build/public/"]
COPY ["src", "/otterscan-build/src/"]
RUN npm run build

FROM alpine:3.15.0
RUN apk add alpine-sdk
WORKDIR /wd
COPY --from=gobuilder /wd/otter /usr/bin/otter
COPY --from=builder /otterscan-build/dist /wd/dist

CMD ["otter"]
