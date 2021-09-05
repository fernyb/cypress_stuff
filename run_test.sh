#!/bin/bash

export CYPRESS_API_URL="http://localhost:1234/"

# CYPRESS_API_URL="http://localhost:1234/" npx cy2 run --parallel --record --key tester --ci-build-id hello-cypress &

npx cypress run --config-file cypress.json --parallel --record --key accounting --ci-build-id cyaccounting-420