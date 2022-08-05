# Running Otterscan (other methods)

## (Alternative 1) Build Otterscan docker image locally and run it

If you don't want to download from Docker Hub, you can build the docker image from the sources and run it.

If you just want to build the image locally, there is no need to install the development toolchain, just make sure you have a recent working Docker installation.

This method requires only `git` and `docker`.

The entire build process will take place inside the docker multi-stage build.

Clone Otterscan repo and its submodules. Checkout the tag corresponding to your Erigon + Otterscan patches. It uses the same version tag from Erigon + Otterscan repo, i.e., if you built the `v2021.07.01-otterscan`, you should build the `v2021.07.01-otterscan` of Otterscan.

```
git clone --recurse-submodules https://github.com/wmitsuda/otterscan.git
cd otterscan
git checkout <version-tag-otterscan>
docker buildx build -t otterscan .
```

This will run the entire build process inside a build container, merge the production build of the React app with the 4bytes and trustwallet assets into the same image format it is published in Docker Hub, but locally under the name `otterscan`.

Then you can start/stop it using the commands:

```
docker run --rm -p 5000:80 --name otterscan -d otterscan
docker stop otterscan
```

## (Alternative 2) Run a development build from the source

First, a brief explanation about the app:

- The app itself is a simple React app which will be run locally and communicates with your Erigon node.
- The app makes use of two sources of external databases for cosmetic reasons:
  - Token icons come from the trustwallet public assets repository.
  - Method names come from the 4bytes database.
- These 2 repositories were cloned as submodules and are made available to the app through separate http services. They are accessed at browser level and are optional, if the service is down the result will be broken icons and default 4bytes method selectors instead of human-readable names.

These instructions are subjected to changes in future for the sake of simplification.

Make sure you have a working node 16/npm 8 installation.

By default, it assumes your Erigon `rpcdaemon` processs is serving requests at `http://localhost:8545`. You can customize this URL by changing the `public/config.json` file.

Start serving 4bytes and trustwallet assets at `localhost:3001` using a dockerized nginx:

```
npm run assets-start
```

To stop it, run:

```
npm run assets-stop
```

To run Otterscan development build:

```
npm install
npm start
```

Otterscan should now be running at `http://localhost:3000/`.
