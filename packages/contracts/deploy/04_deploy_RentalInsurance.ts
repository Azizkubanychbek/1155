import { HardhatRuntimeEnvironment } from "hardhat/types";

export default async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, ethers } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  console.log("Deploying RentalInsurance...");

  // Get ReputationSystem address from previous deployment
  const reputationSystem = await deployments.get("ReputationSystem");
  console.log("Using ReputationSystem at:", reputationSystem.address);

  const rentalInsurance = await deploy("RentalInsurance", {
    from: deployer,
    args: [reputationSystem.address],
    log: true,
  });

  console.log("RentalInsurance deployed to:", rentalInsurance.address);
}
