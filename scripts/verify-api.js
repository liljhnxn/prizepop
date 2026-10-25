const fs = require("fs");
const path = require("path");

async function main() {
  const contractAddress = "0xFe4998f06642223ad57E9cFA6609415C9d11e9e3";
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

  console.log("Submitting verification to https://scan.bohr.life/api ...");

  try {
    const res = await fetch("https://scan.bohr.life/api", {
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
