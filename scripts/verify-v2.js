const fs = require("fs");
const path = require("path");

async function main() {
  const contractAddress = "0xFe4998f06642223ad57E9cFA6609415C9d11e9e3";
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
    file_path: "contracts/PrizePop.sol"
  };

  console.log("Submitting via flattened-code with file_path...");

  try {
    const res = await fetch(
      `https://scan.bohr.life/api/v2/smart-contracts/${contractAddress}/verification/via/flattened-code`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    const text = await res.text();
    console.log("Status:", res.status);
    console.log("Response:", text);
  } catch (err) {
    console.error("Error:", err);
  }
}

main();
