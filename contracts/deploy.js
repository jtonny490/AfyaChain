const hre = require("hardhat");

async function main() {
  console.log("Deploying AfyaChain...");

  const AfyaChain = await hre.ethers.getContractFactory("AfyaChain");
  const contract = await AfyaChain.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("AfyaChain deployed to:", address);
  console.log("Add this to your backend .env as CONTRACT_ADDRESS=", address);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
