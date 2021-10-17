const { default: axios } = require("axios");
const { resolve, reject } = require("bluebird");
const parseJson = require("parse-json");

// const build_id = "Sat 18 Sep 2021 07:15:33 PM PDT";

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
    const payload = `{"operationName":"getRun","variables":{"runId":"${runId}"},"query":"query getRun($runId: ID!) { run(id: $runId) { runId createdAt specs { spec instanceId results { reporterStats { start passes pending failures } } __typename } __typename }}"}`;
    axios.post(url, payload).then((res) => {
      resolve(res.data.data);
    });
  });
};

const getInstance = (instanceId) => {
  return new Promise((resolve) => {
    // const payload = `{"operationName":"getInstance","variables":{"instanceId":"${instanceId}"},"query":"query getInstance($instanceId: ID!) {\n  instance(id: $instanceId) {\n    instanceId\n    runId\n    spec\n    run {\n      runId\n      meta {\n        ciBuildId\n        projectId\n        __typename\n      }\n      __typename\n    }\n    results {\n      error\n      stats {\n        ...AllInstanceStats\n        __typename\n      }\n      tests {\n        ... on InstanceTest {\n          testId\n          title\n          state\n          wallClockDuration\n          wallClockStartedAt\n          error\n          stack\n          __typename\n        }\n        ... on InstanceTestV5 {\n          testId\n          title\n          state\n          displayError\n          attempts {\n            state\n            wallClockDuration\n            wallClockStartedAt\n            error {\n              name\n              message\n              stack\n              __typename\n            }\n            __typename\n          }\n          __typename\n        }\n        __typename\n      }\n      screenshots {\n        testId\n        screenshotId\n        height\n        width\n        screenshotURL\n        __typename\n      }\n      cypressConfig {\n        video\n        videoUploadOnPasses\n        __typename\n      }\n      videoUrl\n      __typename\n    }\n    __typename\n  }\n}\n\nfragment AllInstanceStats on InstanceStats {\n  suites\n  tests\n  pending\n  passes\n  failures\n  skipped\n  suites\n  wallClockDuration\n  wallClockStartedAt\n  wallClockEndedAt\n  __typename\n}\n"}`;
    const payload = `{"operationName":"getInstance","variables":{"instanceId":"${instanceId}"},"query":"query getInstance($instanceId: ID!) { instance(id: $instanceId) { instanceId runId spec run { runId meta { ciBuildId projectId __typename } __typename } results { error stats { ...AllInstanceStats __typename } tests { ... on InstanceTest { testId title state wallClockDuration wallClockStartedAt error stack __typename } ... on InstanceTestV5 { testId title state displayError attempts { state wallClockDuration wallClockStartedAt error { name message stack __typename } __typename } __typename } __typename } screenshots { testId screenshotId height width screenshotURL __typename } cypressConfig { video videoUploadOnPasses __typename } videoUrl __typename } __typename } } fragment AllInstanceStats on InstanceStats { suites tests pending passes failures skipped suites wallClockDuration wallClockStartedAt wallClockEndedAt __typename }"}`;
    axios.post(url, payload).then((res) => {
      resolve(res.data.data);
    });
  })
}

const findBuild = (runIds, buildId) => {
  return new Promise((resolve, reject) => {
    Promise.all(runIds.map((runId) => getRunSummary(runId))).then((ciBuildIds) => {
      const idx = ciBuildIds.findIndex((ciBuildId) => ciBuildId === buildId);
      if (idx >= 0) {
        resolve(runIds[idx]);
      } else {
        reject("Did not find Build");
      }
    });
  });
};

let $runId;

const getRunForBuildId = (buildId) => {
  return new Promise((resolve, reject) => {
    if ($runId) {
      getRun($runId).then((data) => {
        resolve(data);
      });
    } else {
      getProjectId().then((projectId) => {
        getRunFeed(projectId).then((runIds) => {
          findBuild(runIds, buildId).then((runId) => {
            getRun(runId).then((data) => {
              $runId = runId;
              resolve(data);
            });
          }).catch((error) => {
            reject(error);
          })
        });
      })
    }
  });
};

const getReportForBuildId = (buildId) => {
  return new Promise((resolve) => {
    getRunForBuildId(buildId).then((data) => {
      resolve(data);
    }).catch((error) => {
      process.stdout.write(".");
      // console.error("getReportForBuildId: ", error);
    })
  })
}

module.exports = {
  getReportForBuildId,
  getInstance
};
