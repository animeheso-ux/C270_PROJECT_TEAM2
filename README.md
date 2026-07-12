# Learning Quest

## Run the docker-compose at root folder
docker-compose up -d # run in detach mode
docker compose build --no-cache && docker compose up -d --force-recreate

## Run the application
localhost:5173

## Cleanup
docker compose down --rmi local

