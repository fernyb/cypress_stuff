#!/bin/bash

build_id=$(date)
cores=$(grep 'cpu cores' /proc/cpuinfo | uniq | grep -P -o "\d+")
cores=$(($cores-2))

for count in $(seq 1 $cores)
do
  npx cypress run --config-file cypress.json --parallel --record --key "${build_id}" --ci-build-id "${build_id}" 1>2& > /dev/null
done

echo "Running tests...."