const fs = require("fs");
const path = require("path");

const buildInfoDir = path.join(__dirname, "../artifacts/build-info");
const files = fs.readdirSync(buildInfoDir).filter((f) => f.endsWith(".json"));
if (files.length === 0) {
  throw new Error("No build-info file found. Please run npx hardhat compile first.");
}
const buildInfo = JSON.parse(
  fs.readFileSync(path.join(buildInfoDir, files[0]), "utf8")
);

fs.writeFileSync(
  path.join(__dirname, "../contracts/PrizePop_Standard_Input.json"),
  JSON.stringify(buildInfo.input, null, 2)
);

console.log("Saved contracts/PrizePop_Standard_Input.json");
