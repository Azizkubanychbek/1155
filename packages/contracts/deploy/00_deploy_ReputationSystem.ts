import { HardhatRuntimeEnvironment } from "hardhat/types";

export default async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, ethers } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  console.log("Deploying ReputationSystem...");

  const reputationSystem = await deploy("ReputationSystem", {
    from: deployer,
    args: [],
    log: true,
  });

  console.log("ReputationSystem deployed to:", reputationSystem.address);
}
