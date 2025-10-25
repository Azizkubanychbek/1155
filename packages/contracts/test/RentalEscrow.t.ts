import { expect } from "chai";
import { ethers } from "hardhat";
import { RentalEscrow } from "../typechain-types";

describe("RentalEscrow", function () {
  let rentalEscrow: RentalEscrow;
  let owner: any;
  let lender: any;
  let borrower: any;

  beforeEach(async function () {
    [owner, lender, borrower] = await ethers.getSigners();
    
    const RentalEscrowFactory = await ethers.getContractFactory("RentalEscrow");
    rentalEscrow = await RentalEscrowFactory.deploy();
    await rentalEscrow.waitForDeployment();
  });

  describe("Rental management", function () {
    it("Should create rental correctly", async function () {
      const expires = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
      const deposit = ethers.parseEther("0.1");
      
      await expect(
        rentalEscrow.connect(borrower).createRental(
          lender.address,
          borrower.address,
          await ethers.getAddress(), // Mock token address
          1, // Token ID
          10, // Amount
          expires,
          deposit,
          { value: deposit }
        )
      ).to.emit(rentalEscrow, "RentalCreated");
      
      expect(await rentalEscrow.getRentalCount()).to.equal(1);
    });

    it("Should complete rental correctly", async function () {
      const expires = Math.floor(Date.now() / 1000) + 3600;
      const deposit = ethers.parseEther("0.1");
      
      await rentalEscrow.connect(borrower).createRental(
        lender.address,
        borrower.address,
        await ethers.getAddress(),
        1,
        10,
        expires,
        deposit,
        { value: deposit }
      );
      
      await expect(
        rentalEscrow.connect(borrower).completeRental(0)
      ).to.emit(rentalEscrow, "RentalCompleted");
      
      const rental = await rentalEscrow.getRental(0);
      expect(rental.completed).to.be.true;
    });

    it("Should penalize rental correctly", async function () {
      const expires = Math.floor(Date.now() / 1000) + 3600;
      const deposit = ethers.parseEther("0.1");
      
      await rentalEscrow.connect(borrower).createRental(
        lender.address,
        borrower.address,
        await ethers.getAddress(),
        1,
        10,
        expires,
        deposit,
        { value: deposit }
      );
      
      await expect(
        rentalEscrow.penalize(0)
      ).to.emit(rentalEscrow, "RentalPenalized");
      
      const rental = await rentalEscrow.getRental(0);
      expect(rental.penalized).to.be.true;
    });
  });
});
