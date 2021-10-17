const progress = require("cli-progress");
const _colors = require("colors");
const { getReportForBuildId, getInstance } = require("./test");

const build_id = process.argv[2];

console.info("Build Id: %s\n", build_id);

// const bar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
const bar = new progress.SingleBar({
  format: 'Progress |' + _colors.white('{bar}') + '| {percentage}% || {value}/{total} Spec files',
  barCompleteChar: '\u2588',
  barIncompleteChar: '\u2591',
  hideCursor: true,
  barsize: 65,
}, progress.Presets.shades_classic);

const specResults = [];
let intVal;
let isBarSet = false;
let currentCount = 0;

const printFailures = (specFailureResults) => {
  specFailureResults.forEach((s) => {
    getInstance(s.instanceId).then((data) => {
      const failures = [];
      data.instance.results.tests.forEach((test) => {
        if (test.state === "failed") {
          failures.push(`Test: ${test.title.join(" > ")}\nError: ${test.displayError}`);
        }
      });

      if (failures.length > 0) {
        console.info("Spec: %s\n", s.spec);
        console.info(failures.join("\n----------\n"));
        console.log("");
      }
    });
  });
};

const getReport = (buildId) => {
  getReportForBuildId(buildId).then((specs) => {
    if (!isBarSet) {
      isBarSet = true;
      bar.start(specs.run.specs.length, 0);
    }

    specs.run.specs.forEach((spec, index) => {
      if (spec.results) {
        specResults[index] = {
          spec: spec.spec,
          instanceId: spec.instanceId,
          stats: spec.results.reporterStats
        };
      }
    })

    if (currentCount < specResults.length) {
      bar.update(specResults.length);
    }

    if (specResults.length === specs.run.specs.length) {
      clearInterval(intVal);
      bar.update(specResults.length);
      bar.stop();
      console.log("");

      specFailureResults = specResults.filter((s) => s.stats.failures > 0);
      if (specFailureResults.length > 0) {
        printFailures(specFailureResults);
      }
    }
  });
};

intVal = setInterval(() => {
  getReport(build_id);
}, 1000);
