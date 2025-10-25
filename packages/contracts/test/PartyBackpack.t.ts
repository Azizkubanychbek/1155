import { expect } from "chai";
import { ethers } from "hardhat";
import { PartyBackpack } from "../typechain-types";
import { UsageRights1155 } from "../typechain-types";

describe("PartyBackpack", function () {
  let usageRights: UsageRights1155;
  let partyBackpack: PartyBackpack;
  let owner: any;
  let user1: any;
  let user2: any;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();
    
    // Deploy UsageRights1155 first
    const UsageRights1155Factory = await ethers.getContractFactory("UsageRights1155");
    usageRights = await UsageRights1155Factory.deploy("https://api.backpackguilds.com/metadata/");
    await usageRights.waitForDeployment();
    
    // Deploy PartyBackpack
    const PartyBackpackFactory = await ethers.getContractFactory("PartyBackpack");
    partyBackpack = await PartyBackpackFactory.deploy(await usageRights.getAddress());
    await partyBackpack.waitForDeployment();
    
    // Mint some tokens to owner
    await usageRights.mint(owner.address, 1, 100, "0x");
  });

  describe("Deposit functionality", function () {
    it("Should deposit tokens correctly", async function () {
      await usageRights.setApprovalForAll(await partyBackpack.getAddress(), true);
      await partyBackpack.deposit(1, 50);
      
      expect(await partyBackpack.partyBalance(1)).to.equal(50);
    });

    it("Should grant usage from party inventory", async function () {
      await usageRights.setApprovalForAll(await partyBackpack.getAddress(), true);
      await partyBackpack.deposit(1, 50);
      
      const expires = Math.floor(Date.now() / 1000) + 3600;
      await partyBackpack.grantUsage(user1.address, 1, 25, expires);
      
      expect(await partyBackpack.activeUsers(1)).to.equal(1);
    });

    it("Should reclaim tokens correctly", async function () {
      await usageRights.setApprovalForAll(await partyBackpack.getAddress(), true);
      await partyBackpack.deposit(1, 50);
      await partyBackpack.reclaim(1, 25);
      
      expect(await partyBackpack.partyBalance(1)).to.equal(25);
    });
  });
});
