#!/usr/bin/env bash
set -e

cd /root/task

echo "[run.sh] Starting Docker services with docker-compose..."
docker-compose -f /root/task/docker-compose.yml up -d

echo "[run.sh] Waiting for MongoDB to become ready..."
MAX_ATTEMPTS=30
ATTEMPT=1

while true; do
  if [ ${ATTEMPT} -gt ${MAX_ATTEMPTS} ]; then
    echo "[run.sh] ERROR: MongoDB did not become ready in time."
    docker-compose -f /root/task/docker-compose.yml logs mongo || true
    exit 1
  fi

  if docker exec utkrusht_mongo mongosh -u root -p rootpassword --authenticationDatabase admin --eval "db.adminCommand({ ping: 1 })" >/dev/null 2>&1; then
    echo "[run.sh] MongoDB is ready."
    break
  else
    echo "[run.sh] MongoDB not ready yet (attempt ${ATTEMPT}/${MAX_ATTEMPTS})..."
    ATTEMPT=$((ATTEMPT + 1))
    sleep 2
  fi
done

echo "[run.sh] Waiting for Node.js API to start responding..."
API_MAX_ATTEMPTS=30
API_ATTEMPT=1

while true; do
  if [ ${API_ATTEMPT} -gt ${API_MAX_ATTEMPTS} ]; then
    echo "[run.sh] ERROR: Node.js API did not become ready in time."
    docker-compose -f /root/task/docker-compose.yml logs api || true
    exit 1
  fi

  if curl -s http://localhost:3000/api/health >/dev/null 2>&1; then
    echo "[run.sh] Node.js API is responding."
    break
  else
    echo "[run.sh] API not ready yet (attempt ${API_ATTEMPT}/${API_MAX_ATTEMPTS})..."
    API_ATTEMPT=$((API_ATTEMPT + 1))
    sleep 2
  fi
done

echo "[run.sh] All services are up and running."
