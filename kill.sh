#!/usr/bin/env bash
set -e

echo "[kill.sh] Stopping and removing containers, networks, and volumes for task..."

docker-compose -f /root/task/docker-compose.yml down --volumes --remove-orphans || true

echo "[kill.sh] Removing related Docker images (application and mongo)..."
APP_IMAGES=$(docker images -q | grep -E 'utkrusht-node-mongo-basic-optimization|utkrusht_api' || true)
if [ -n "${APP_IMAGES}" ]; then
  docker rmi -f ${APP_IMAGES} || true
fi

MONGO_IMAGES=$(docker images -q mongo || true)
if [ -n "${MONGO_IMAGES}" ]; then
  docker rmi -f ${MONGO_IMAGES} || true
fi

echo "[kill.sh] Running global Docker system prune (this may take a while)..."
docker system prune -a --volumes -f || true

echo "[kill.sh] Deleting task directory at /root/task..."
rm -rf /root/task || true

echo "[kill.sh] Cleanup completed successfully! Droplet is now clean."
