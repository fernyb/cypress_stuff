#!/bin/bash

build_id="Sun 05 Sep 2021 07:07:17 PM PDT"

function run_tests() {
  resource_app_path=$(DEBUG=cypress:cli npx cypress version 2>&1 | grep package.json | sed -n 's/.*from: \(.*\)\/package.json/\1/p')
  appyml=$(find . $resource_app_path | grep config\/app\.yml | head -n1)
  sed -i "s/\"https:\/\/api.cypress.io\/\"/\"http:\/\/localhost:1234\/\"/" $appyml
  sed -i "s/\"https:\/\/on.cypress.io\/\"/\"http:\/\/localhost:8080\/\"/" $appyml

  build_id=$(date)
  cores=$(grep 'cpu cores' /proc/cpuinfo | uniq | grep -P -o "\d+")
  cores=$(($cores-2))

  for count in $(seq 1 $cores)
  do
    npx cypress run --config-file cypress.json --parallel --record --key "${build_id}" --ci-build-id "${build_id}" > /dev/null &
  done

  echo "Running tests...."

  sleep 5
}

function get_run() {
  local runId="${1}"
  local payload='{"operationName":"getRun","variables":{"runId":"{runId}"},"query":"query getRun($runId: ID!) {\n  run(id: $runId) {\n    runId\n    createdAt\n    completion {\n      ...RunSummaryCompletion\n      __typename\n    }\n    meta {\n      ...RunSummaryMeta\n      __typename\n    }\n    specs {\n      ...RunDetailSpec\n      __typename\n    }\n    __typename\n  }\n}\n\nfragment RunSummaryCompletion on RunCompletion {\n  completed\n  inactivityTimeoutMs\n  __typename\n}\n\nfragment RunSummaryMeta on RunMeta {\n  ciBuildId\n  projectId\n  commit {\n    sha\n    branch\n    remoteOrigin\n    message\n    authorEmail\n    authorName\n    __typename\n  }\n  __typename\n}\n\nfragment RunDetailSpec on RunSpec {\n  instanceId\n  spec\n  claimedAt\n  machineId\n  groupId\n  results {\n    error\n    tests {\n      ... on InstanceTest {\n        state\n        __typename\n      }\n      ... on InstanceTestV5 {\n        state\n        attempts {\n          state\n          __typename\n        }\n        __typename\n      }\n      __typename\n    }\n    stats {\n      ...AllInstanceStats\n      __typename\n    }\n    __typename\n  }\n  __typename\n}\n\nfragment AllInstanceStats on InstanceStats {\n  suites\n  tests\n  pending\n  passes\n  failures\n  skipped\n  suites\n  wallClockDuration\n  wallClockStartedAt\n  wallClockEndedAt\n  __typename\n}\n"}'
  payload=$(echo $payload | sed -n "s/{runId}/${runId}/p")
  echo $(curl -s -g -X POST -H "Content-Type: application/json" -d "${payload}" http://localhost:4000/)
}

function get_run_summary() {
  local runId="${1}"
  local payload='{"operationName":"getRunSummary","variables":{"runId":"{runId}"},"query":"query getRunSummary($runId: ID!) {\n  run(id: $runId) {\n    runId\n    createdAt\n    meta {\n      ...RunSummaryMeta\n      __typename\n    }\n    completion {\n      ...RunSummaryCompletion\n      __typename\n    }\n    specs {\n      ...RunSummarySpec\n      __typename\n    }\n    __typename\n  }\n}\n\nfragment RunSummaryMeta on RunMeta {\n  ciBuildId\n  projectId\n  commit {\n    sha\n    branch\n    remoteOrigin\n    message\n    authorEmail\n    authorName\n    __typename\n  }\n  __typename\n}\n\nfragment RunSummaryCompletion on RunCompletion {\n  completed\n  inactivityTimeoutMs\n  __typename\n}\n\nfragment RunSummarySpec on RunSpec {\n  claimedAt\n  results {\n    stats {\n      ...AllInstanceStats\n      __typename\n    }\n    __typename\n  }\n  __typename\n}\n\nfragment AllInstanceStats on InstanceStats {\n  suites\n  tests\n  pending\n  passes\n  failures\n  skipped\n  suites\n  wallClockDuration\n  wallClockStartedAt\n  wallClockEndedAt\n  __typename\n}\n"}'
  payload=$(echo $payload | sed -n "s/{runId}/${runId}/p")
  echo $(curl -s -g -X POST -H "Content-Type: application/json" -d "${payload}" http://localhost:4000/)
}

function get_project_id() {
  local res=$(curl -s -g -X POST \
  -H "Content-Type: application/json" \
  -d '{"operationName":"getProjects","variables":{"filters":[]},"query":"query getProjects($orderDirection: OrderingOptions, $filters: [Filters]) {\n  projects(orderDirection: $orderDirection, filters: $filters) {\n    projectId\n    __typename\n  }\n}\n"}' \
  http://localhost:4000/)

  echo $(echo $res | jq '.data.projects[].projectId' | head -n1 | tr -d "\"")
}

function get_runs_feed() {
  local projectId="${1}"
  local payload='{"operationName":"getRunsFeed","variables":{"filters":[{"key":"meta.projectId","value":"{projectId}"}],"cursor":""},"query":"query getRunsFeed($cursor: String, $filters: [Filters]) {\n  runFeed(cursor: $cursor, filters: $filters) {\n    cursor\n    hasMore\n    runs {\n      runId\n      createdAt\n      __typename\n    }\n    __typename\n  }\n}\n"}'
  payload=$(echo $payload | sed -n "s/{projectId}/${projectId}/p")

  local res=$(curl -s -g -X POST -H "Content-Type: application/json" -d "${payload}" http://localhost:4000/)
  echo $(echo $res | jq ".data.runFeed.runs[].runId" | tr -d "\"")
}

function get_results() {
  local build_id="${1}"
  local projectId=$(get_project_id)
  local runIds=$(get_runs_feed "${projectId}")

  for runid in ${runIds}
  do
    res=$(get_run_summary ${runid})
    local ciBuildId=$(echo $res | jq ".data.run.meta.ciBuildId" | tr -d "\"")

    if [[ $ciBuildId == $build_id ]]; then
      res=$(get_run ${runid})
      # echo $(echo $res | jq ".data.run.specs")
      local specs_json=$(echo $res | jq "[.data.run.specs[] | { spec: .spec,  suites: .results.stats.suites, tests: .results.stats.tests, skipped: .results.stats.skipped, failures: .results.stats.failures, passes: .results.stats.passes, pending: .results.stats.pending }]")
      break
      # echo $(echo $specs | jq '.[]')

      # for spec in ${specs}
      # do
      #   echo specs
      # done
    fi
  done

  echo $specs_json
}

results=$(get_results "${build_id}")

echo "Results: "
echo $results
