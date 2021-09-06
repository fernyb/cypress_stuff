build:
	docker build --pull -t cypresstest:v1 -f ./Dockerfile .

run:
	docker container run --rm --tty --interactive cypresstest:v1

start:
	docker-compose up -d

stop:
	docker-compose down

test:
	docker-compose --profile services up -d
	sleep 1
	./run_test.sh
