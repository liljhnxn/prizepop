const hre = require("hardhat");

async function main() {
  console.log("----------------------------------------------------");
  console.log("PrizePop Deployment to Network:", hre.network.name);
  console.log("----------------------------------------------------");

  const [deployer] = await hre.ethers.getSigners();
  if (!deployer) {
    throw new Error(
      "No deployer signer found. Please ensure PRIVATE_KEY is set in your .env.local or environment."
    );
  }

  const deployerAddress = await deployer.getAddress();
  const balance = await hre.ethers.provider.getBalance(deployerAddress);
  console.log("Deployer address:", deployerAddress);
  console.log("Deployer balance:", hre.ethers.formatEther(balance), "BOT");

  if (balance === 0n && hre.network.name !== "hardhat") {
    console.warn(
      "WARNING: Deployer has 0 BOT balance. Deployment might fail due to lack of gas funds."
    );
  }

  console.log("\nCompiling and deploying PrizePop contract...");
  const PrizePopFactory = await hre.ethers.getContractFactory("PrizePop");
  const prizePop = await PrizePopFactory.deploy();

  console.log("Waiting for deployment transaction confirmation...");
  await prizePop.waitForDeployment();

  const deployedAddress = await prizePop.getAddress();
  console.log("\n====================================================");
  console.log("SUCCESS! PrizePop deployed at:", deployedAddress);
  console.log("====================================================");
  console.log("\nNEXT STEPS:");
  console.log("1. Open (or create) .env.local in the project root.");
  console.log("2. Set the deployed contract address:");
  console.log(`   NEXT_PUBLIC_CONTRACT_ADDRESS=${deployedAddress}`);
  console.log("3. Start your frontend with: npm run dev");
  console.log("4. View on Botchain Explorer: https://scan.bohr.life/address/" + deployedAddress);
  console.log("----------------------------------------------------\n");
}

main().catch((error) => {
  console.error("Deployment failed:", error);
  process.exitCode = 1;
});
