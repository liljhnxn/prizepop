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
  const network = await hre.ethers.provider.getNetwork();
  const chainId = Number(network.chainId);

  console.log("Deployer address:", deployerAddress);
  console.log("Deployer balance:", hre.ethers.formatEther(balance), "BOT");
  console.log("Network Chain ID:", chainId);

  // Gas estimation and fee optimization
  const feeData = await hre.ethers.provider.getFeeData();
  const gasPrice = feeData.gasPrice || hre.ethers.parseUnits("20", "gwei");
  console.log("Gas price:", hre.ethers.formatUnits(gasPrice, "gwei"), "gwei");

  if (balance === 0n && hre.network.name !== "hardhat") {
    console.warn(
      "WARNING: Deployer has 0 BOT balance. Deployment might fail due to lack of gas funds."
    );
  }

  console.log("\nEstimating deployment gas...");
  const PrizePopFactory = await hre.ethers.getContractFactory("PrizePop");
  const deployTx = await PrizePopFactory.getDeployTransaction();
  const estimatedGas = await hre.ethers.provider.estimateGas(deployTx);
  const estimatedCost = estimatedGas * gasPrice;

  console.log("Estimated gas units:", estimatedGas.toString());
  console.log("Estimated deployment cost:", hre.ethers.formatEther(estimatedCost), "BOT");

  if (balance < estimatedCost && hre.network.name !== "hardhat") {
    throw new Error(
      `Insufficient funds for deployment. Balance is ${hre.ethers.formatEther(
        balance
      )} BOT, required is ~${hre.ethers.formatEther(estimatedCost)} BOT`
    );
  }

  console.log("\nDeploying PrizePop contract (using minimal gas fee)...");
  // Set gasPrice to exact network gasPrice so no extra fee is used
  const prizePop = await PrizePopFactory.deploy({
    gasPrice: gasPrice,
  });

  console.log("Transaction hash:", prizePop.deploymentTransaction()?.hash);
  console.log("Waiting for deployment confirmation...");
  await prizePop.waitForDeployment();

  const deployedAddress = await prizePop.getAddress();
  const explorerUrl = "https://scan.botchain.ai";

  console.log("\n====================================================");
  console.log("SUCCESS! PrizePop deployed at:", deployedAddress);
  console.log("====================================================");
  console.log("\nNEXT STEPS:");
  console.log("1. Update .env.local in your project root with:");
  console.log(`   NEXT_PUBLIC_CONTRACT_ADDRESS=${deployedAddress}`);
  console.log(`2. View on Explorer: ${explorerUrl}/address/${deployedAddress}`);
  console.log("----------------------------------------------------\n");
}

main().catch((error) => {
  console.error("Deployment failed:", error);
  process.exitCode = 1;
});
