const fs = require("fs");
const path = require("path");

const buildInfo = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, "../artifacts/build-info/42062ba638eef82e3e6e62e5001d3992.json"),
    "utf8"
  )
);

fs.writeFileSync(
  path.join(__dirname, "../contracts/PrizePop_Standard_Input.json"),
  JSON.stringify(buildInfo.input, null, 2)
);

console.log("Saved contracts/PrizePop_Standard_Input.json");
