build:
	docker build --pull -t cypresstest:v1 -f ./Dockerfile .

run:
	docker container run --rm --tty --interactive cypresstest:v1

compose:
	docker-compose up --scale cypress=4
	docker-compose down