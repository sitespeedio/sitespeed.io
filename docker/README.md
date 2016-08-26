Run ./build-all.sh from this directory to build all containers.

Note that all naming is temporary.

Once all are built, develop as normal, and just rebuild the sitespeed-app image.

A difference from the previous sitespeed image is that the sitespeed command is implicit. Just pass the args to the container as such:
```sh
docker run --rm sitespeed-app https://www.sitespeed.io -n1
```

Notes:
To launch the app container without launching sitespeed use
```sh
docker run -it --rm --entrypoint bash sitespeed-app
```
