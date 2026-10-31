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

  const params = new URLSearchParams({
    module: "contract",
    action: "verifysourcecode",
    contractaddress: contractAddress,
    sourceCode: sourceCode,
    codeformat: "solidity-single-file",
    contractname: "PrizePop",
    compilerversion: "v0.8.20+commit.a1b79de6",
    optimizationUsed: "1",
    runs: "200",
    constructorArguements: "",
    evmversion: "paris",
    licenseType: "3",
  });

  const apiEndpoint = process.env.BOTCHAIN_EXPLORER_API || "https://scan.botchain.ai/api";
  console.log(`Submitting verification for ${contractAddress} to ${apiEndpoint} ...`);

  try {
    const res = await fetch(apiEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    const data = await res.json();
    console.log("Explorer API Response:", data);
  } catch (err) {
    console.error("Verification request error:", err);
  }
}

main();
