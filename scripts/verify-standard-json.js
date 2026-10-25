const fs = require("fs");
const path = require("path");

async function main() {
  const contractAddress = "0xFe4998f06642223ad57E9cFA6609415C9d11e9e3";
  const buildInfoPath = path.join(
    __dirname,
    "../artifacts/build-info/42062ba638eef82e3e6e62e5001d3992.json"
  );

  const buildInfo = JSON.parse(fs.readFileSync(buildInfoPath, "utf8"));
  const standardJsonInput = JSON.stringify(buildInfo.input);

  console.log("Solc Long Version:", buildInfo.solcLongVersion);

  const params = new URLSearchParams({
    module: "contract",
    action: "verifysourcecode",
    contractaddress: contractAddress,
    sourceCode: standardJsonInput,
    codeformat: "solidity-standard-json-input",
    contractname: "contracts/PrizePop.sol:PrizePop",
    compilerversion: "v" + buildInfo.solcLongVersion,
  });

  console.log("Submitting standard JSON input verification to Bohr scan...");

  try {
    const res = await fetch("https://scan.bohr.life/api", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    const data = await res.json();
    console.log("Response:", data);

    if (data.status === "1" && data.result) {
      console.log("Waiting 8s to check status...");
      await new Promise((r) => setTimeout(r, 8000));
      const statusRes = await fetch(
        `https://scan.bohr.life/api?module=contract&action=checkverifystatus&guid=${data.result}`
      );
      const statusData = await statusRes.json();
      console.log("Verification status:", statusData);
    }
  } catch (err) {
    console.error("Error:", err);
  }
}

main();
