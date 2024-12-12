#!/bin/node
const fs = require("fs");

const environment = process.argv[2];

fs.readFile(
  `src/env/environments/${environment}.js`,
  "utf8",
  function (err, contents) {
    if (!err) {
      fs.writeFile("src/env/index.js", contents, (e) => {
        if (!e) {
          console.log(
            `🚀 Loading the [${environment}] environment successfully.`
          );
        }
      });
    }
  }
);
