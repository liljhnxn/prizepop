require("dotenv").config({ path: ".env.local" });
require("dotenv").config();
const fs = require("fs");
const path = require("path");

async function main() {
  const contractAddress =
    process.argv[2] || process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

  if (!contractAddress) {
    console.error("Please provide a contract address as argument or NEXT_PUBLIC_CONTRACT_ADDRESS in .env.local");
    process.exit(1);
  }

  // Find the build-info file
  const buildInfoDir = path.join(__dirname, "../artifacts/build-info");
  const files = fs.readdirSync(buildInfoDir).filter((f) => f.endsWith(".json"));
  if (files.length === 0) {
    throw new Error("No build-info file found. Please run npx hardhat compile first.");
  }
  const buildInfoPath = path.join(buildInfoDir, files[0]);

  const buildInfo = JSON.parse(fs.readFileSync(buildInfoPath, "utf8"));
  const standardJsonInput = JSON.stringify(buildInfo.input);

  console.log("Target Contract:", contractAddress);
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

  const apiEndpoint = process.env.BOTCHAIN_EXPLORER_API || "https://scan.botchain.ai/api";
  console.log(`Submitting standard JSON input verification to ${apiEndpoint} ...`);

  try {
    const res = await fetch(apiEndpoint, {
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
        `${apiEndpoint}?module=contract&action=checkverifystatus&guid=${data.result}`
      );
      const statusData = await statusRes.json();
      console.log("Verification status:", statusData);
    }
  } catch (err) {
    console.error("Error:", err);
  }
}

main();
