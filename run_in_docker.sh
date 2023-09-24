#!/bin/bash
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"
cd "${DIR}" || exit 1

image=$(docker build -q .)
docker run -v "$(pwd)/parameters.yaml:/home/node/parameters.yaml" --net host "$image"
