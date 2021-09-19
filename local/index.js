const blessed = require("blessed");
const contrib = require("blessed-contrib");
const colors = require('colors/safe');

const { getReportForBuildId } = require("./test");

// const build_id = "Sun 05 Sep 2021 07:07:17 PM PDT";
const build_id = process.argv[2];

console.log("Build Id: ");
console.log(build_id);

const screen = blessed.screen({
  smartCSR: true
});

const grid = new contrib.grid({ rows: 12, cols: 12, screen: screen });

// grid.set(row, col, rowSpan, colSpan, obj, opts)
// const box = grid.set(4, 0, 4, 4, blessed.box, { label: "Tests" });

const table = contrib.table({
  keys: false,
  fg: 'white',
  interactive: false,
  label: 'Tests',
  width: "99%",
  height: "99%",
  border: {
    type: "line",
    fg: "white"
  },
  columnSpacing: 2,
  columnWidth: [74, 10, 10, 10, 10, 10, 10]
});

table.focus();
screen.append(table);

let tableData = {
  headers: ["Spec", "Suites", "Tests", "Passes", "Failures", "Skipped", "Pending"],
  data: []
};

table.setData(tableData);

const tableLine = (color, spec) => {
  return [
    color(spec.spec),
    color(spec.suites),
    color(spec.tests),
    color(spec.passes),
    color(spec.failures),
    color(spec.skipped),
    color(spec.pending)
  ];
};

const getReport = (buildId) => {
  getReportForBuildId(buildId).then((specs) => {
    const rows = specs.map((spec) => {
      if (spec.failures > 0) {
        return tableLine(colors.red, spec);
      }
      if (spec.failures === 0 && spec.passes > 0 && spec.skipped === 0 && spec.pending === 0) {
        return tableLine(colors.green, spec);
      }
      return tableLine(colors.white, spec);
    });

    tableData.data = rows;
    table.setData(tableData);
    screen.render();
  });
};

getReport(build_id);

setInterval(() => {
  getReport(build_id);
}, 2000);

// Quit on Escape q, or Control-C
screen.key(['escape', 'q', 'C-c'], (ch, key) => {
  return process.exit(0);
});

// Render the screen.
screen.render();
