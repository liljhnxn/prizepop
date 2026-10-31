require("dotenv").config({ path: ".env.local" });
require("dotenv").config();
const fs = require("fs");
const path = require("path");

async function main() {
  const contractAddress =
    process.argv[2] ||
    process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ||
    "0x38AaD618b663e5E14431965a26d50FC76fb90273";
  const sourceCode = fs.readFileSync(
    path.join(__dirname, "../contracts/PrizePop.sol"),
    "utf8"
  );

  const payload = {
    compiler_version: "v0.8.20+commit.a1b79de6",
    source_code: sourceCode,
    is_optimization_enabled: true,
    optimization_runs: 200,
    contract_name: "PrizePop",
    autodetect_constructor_args: false,
    constructor_args: "",
    evm_version: "paris",
    license_type: "none",
    file_path: "contracts/PrizePop.sol",
  };

  const endpoint = `https://scan.botchain.ai/api/v2/smart-contracts/${contractAddress}/verification/via/flattened-code`;
  console.log(`Submitting verification to ${endpoint}...`);

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const text = await res.text();
    console.log("Status:", res.status);
    console.log("Response:", text);
  } catch (err) {
    console.error("Error:", err);
  }
}

main();
