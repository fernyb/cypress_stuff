#!/bin/bash

# build_id="Sun 05 Sep 2021 07:07:17 PM PDT"
build_id=$(date)

function run_tests() {
  resource_app_path=$(DEBUG=cypress:cli npx cypress version 2>&1 | grep package.json | sed -n 's/.*from: \(.*\)\/package.json/\1/p')
  appyml=$(find . $resource_app_path | grep config\/app\.yml | head -n1)
  sed -i "s/\"https:\/\/api.cypress.io\/\"/\"http:\/\/localhost:1234\/\"/" $appyml
  sed -i "s/\"https:\/\/on.cypress.io\/\"/\"http:\/\/localhost:8080\/\"/" $appyml

  build_id=$(date)
  cores=$(grep 'cpu cores' /proc/cpuinfo | uniq | grep -P -o "\d+")
  cores=$(($cores / 2))

  for count in $(seq 1 $cores)
  do
    npx cypress run --config-file cypress.json --parallel --record --key "${build_id}" --ci-build-id "${build_id}" > /dev/null &
  done
}

run_tests

cd terminal/ && npx node ./index.js "${build_id}"
