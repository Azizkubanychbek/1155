import { expect } from "chai";
import { ethers } from "hardhat";
import { UsageRights1155 } from "../typechain-types";

describe("UsageRights1155", function () {
  let usageRights: UsageRights1155;
  let owner: any;
  let user1: any;
  let user2: any;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();
    
    const UsageRights1155Factory = await ethers.getContractFactory("UsageRights1155");
    usageRights = await UsageRights1155Factory.deploy("https://api.backpackguilds.com/metadata/");
    await usageRights.waitForDeployment();
  });

  describe("Basic functionality", function () {
    it("Should mint tokens correctly", async function () {
      await usageRights.mint(owner.address, 1, 100, "0x");
      expect(await usageRights.balanceOf(owner.address, 1)).to.equal(100);
    });

    it("Should set usage rights correctly", async function () {
      await usageRights.mint(owner.address, 1, 100, "0x");
      
      const expires = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
      await usageRights.setUser(1, user1.address, 50, expires);
      
      const [user, userExpires, amount] = await usageRights.userOf(1, owner.address);
      expect(user).to.equal(user1.address);
      expect(amount).to.equal(50);
    });

    it("Should check user activity correctly", async function () {
      await usageRights.mint(owner.address, 1, 100, "0x");
      
      const expires = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
      await usageRights.setUser(1, user1.address, 50, expires);
      
      expect(await usageRights.isUserActive(1, owner.address, user1.address)).to.be.true;
      expect(await usageRights.isUserActive(1, owner.address, user2.address)).to.be.false;
    });

    it("Should revoke usage rights correctly", async function () {
      await usageRights.mint(owner.address, 1, 100, "0x");
      
      const expires = Math.floor(Date.now() / 1000) + 3600;
      await usageRights.setUser(1, user1.address, 50, expires);
      await usageRights.revokeUser(1, user1.address);
      
      expect(await usageRights.isUserActive(1, owner.address, user1.address)).to.be.false;
    });

    it("Should handle expired usage rights", async function () {
      await usageRights.mint(owner.address, 1, 100, "0x");
      
      const expires = Math.floor(Date.now() / 1000) + 1; // 1 second from now
      await usageRights.setUser(1, user1.address, 50, expires);
      
      expect(await usageRights.isUserActive(1, owner.address, user1.address)).to.be.true;
      
      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      expect(await usageRights.isUserActive(1, owner.address, user1.address)).to.be.false;
    });
  });
});
