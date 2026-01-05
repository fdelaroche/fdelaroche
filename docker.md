# Docker

## Copy a file to/from a docker container to the local filesystem

Example for an nginx config file.

```bash
docker cp <containerId>:/etc/nginx/conf.d/default.conf ~/default.conf
```

## Run a command in a running docker container

```bash
docker exec -it <container> bash
```

## Run a image with a specific command instead of the default entrypoint

```bash
docker run -it <image>:<tag> sh
```

## Run an command in a stopped container

```bash
docker commit <containerId> user/test_image
docker run -it --entrypoint=sh user/test_image
```

## Copy file from an image without starting it

```bash
docker create --name dummy IMAGE_NAME
docker cp dummy:/path/to/file /dest/to/file
docker rm -f dummy
```

## List the mounts of a container

```bash
docker inspect cognos-analytics | jq '.[0].Mounts'
```

## Generate a command line to start a container with the same parameters

```bash
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock:ro \ assaflavie/runlike YOUR-CONTAINER
```

## Stop all docker container

```bash
docker stop $(docker ps -a -q)
```

## Delete all stopped container

```bash
docker container prune
```
