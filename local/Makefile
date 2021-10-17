stop:
	docker-compose -f local/docker-compose.local.services.yml down

start:
	docker-compose -f local/docker-compose.local.services.yml --profile services up -d

test:
ifdef $(config)
	cd local && ./run_tests.sh -c $(config)
else
	cd local && ./run_tests.sh
endif