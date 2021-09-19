const { default: axios } = require("axios");
const parseJson = require("parse-json");

const build_id = "Sun 05 Sep 2021 07:07:17 PM PDT";

const url = "http://localhost:4000/";

axios.defaults.headers.post["Content-Type"] = "application/json";

const getProjectId = () => {
  return new Promise((resolve) => {
    const payload = `{"operationName":"getProjects","variables":{"filters":[]},"query":"query getProjects($orderDirection: OrderingOptions, $filters: [Filters]) { projects(orderDirection: $orderDirection, filters: $filters) { projectId } }"}`;
    axios.post(url, payload).then((res) => {
      resolve(res.data.data.projects[0].projectId);
    });
  });
};

const getRunFeed = (projectId) => {
  return new Promise((resolve) => {
    const payload = `{"operationName":"getRunsFeed","variables":{"filters":[{"key":"meta.projectId","value":"${projectId}"}],"cursor":""},"query":"query getRunsFeed($cursor: String, $filters: [Filters]) { runFeed(cursor: $cursor, filters: $filters) { cursor hasMore runs { runId createdAt __typename } __typename }}"}`
    axios.post(url, payload).then((res) => {
      resolve(res.data.data.runFeed.runs.map(r => r.runId));
    });
  });
};

const getRunSummary = (runId) => {
  return new Promise((resolve) => {
    const payload = `{"operationName":"getRunSummary","variables":{"runId":"${runId}"},"query":"query getRunSummary($runId: ID!) { run(id: $runId) { runId createdAt meta { ...RunSummaryMeta __typename } completion { ...RunSummaryCompletion __typename } specs { ...RunSummarySpec __typename } __typename }} fragment RunSummaryMeta on RunMeta { ciBuildId projectId commit { sha branch remoteOrigin message authorEmail authorName __typename } __typename } fragment RunSummaryCompletion on RunCompletion { completed inactivityTimeoutMs __typename } fragment RunSummarySpec on RunSpec { claimedAt results { stats { ...AllInstanceStats __typename } __typename } __typename } fragment AllInstanceStats on InstanceStats { suites tests pending passes failures skipped suites wallClockDuration wallClockStartedAt wallClockEndedAt __typename }"}`;
    axios.post(url, payload).then((res) => {
      resolve(res.data.data.run.meta.ciBuildId);
    });
  });
};

const getRun = (runId) => {
  return new Promise((resolve) => {
    const payload = `{"operationName":"getRun","variables":{"runId":"${runId}"},"query":"query getRun($runId: ID!) { run(id: $runId) { runId createdAt completion { ...RunSummaryCompletion __typename } meta { ...RunSummaryMeta __typename } specs { ...RunDetailSpec __typename } __typename }} fragment RunSummaryCompletion on RunCompletion { completed inactivityTimeoutMs __typename } fragment RunSummaryMeta on RunMeta { ciBuildId projectId commit { sha branch remoteOrigin message authorEmail authorName __typename } __typename } fragment RunDetailSpec on RunSpec { instanceId spec claimedAt machineId groupId results { error tests { ... on InstanceTest { state __typename } ... on InstanceTestV5 { state attempts { state __typename } __typename } __typename } stats { ...AllInstanceStats __typename } __typename } __typename } fragment AllInstanceStats on InstanceStats { suites tests pending passes failures skipped suites wallClockDuration wallClockStartedAt wallClockEndedAt __typename }"}`;
    axios.post(url, payload).then((res) => {
      resolve(res.data.data);
    });
  });
};

const getRunForBuildId = (buildId) => {
  return new Promise((resolve) => {
    getProjectId().then((projectId) => {
      getRunFeed(projectId).then((runIds) => {
        runIds.forEach((runId) => {
          getRunSummary(runId).then((ciBuildId) => {
            if (ciBuildId === buildId) {
              getRun(runId).then((data) => {
                resolve(data);
              });
            }
          });
        });
      });
    })
  });
};

const getReportForBuildId = (buildId) => {
  return new Promise((resolve) => {
    getRunForBuildId(buildId).then((data) => {
      const report = data.run.specs.map((spec) => {
        if (spec.results) {
          return {
            spec: spec.spec,
            suites: spec.results.stats.suites,
            tests: spec.results.stats.tests,
            pending: spec.results.stats.pending,
            passes: spec.results.stats.passes,
            failures: spec.results.stats.failures,
            skipped: spec.results.stats.skipped,
          };
        }
        return {
          spec: spec.spec,
          suites: 0,
          tests: 0,
          pending: 0,
          passes: 0,
          failures: 0,
          skipped: 0
        };
      });
      resolve(report);
    });
  })
}

module.exports = {
  getReportForBuildId
};
