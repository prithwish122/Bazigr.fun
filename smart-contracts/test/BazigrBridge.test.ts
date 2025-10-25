import { expect } from "chai";
import { ethers } from "hardhat";
import { BazigrBridge } from "../typechain-types";

describe("BazigrBridge", function () {
  let bridge: BazigrBridge;
  let bazigrToken: any;
  let owner: any;
  let user: any;

  beforeEach(async function () {
    [owner, user] = await ethers.getSigners();

    // Deploy mock Bazigr token
    const BazigrToken = await ethers.getContractFactory("Bazigr");
    bazigrToken = await BazigrToken.deploy();
    await bazigrToken.waitForDeployment();

    // Deploy bridge contract
    const BazigrBridge = await ethers.getContractFactory("BazigrBridge");
    bridge = await BazigrBridge.deploy(await bazigrToken.getAddress());
    await bridge.waitForDeployment();

    // Mint some tokens to user
    await bazigrToken.mint(user.address, ethers.parseEther("1000"));
  });

  describe("Deployment", function () {
    it("Should set the correct owner", async function () {
      expect(await bridge.owner()).to.equal(owner.address);
    });

    it("Should set the correct token address", async function () {
      expect(await bridge.bazigrToken()).to.equal(await bazigrToken.getAddress());
    });

    it("Should be unpaused by default", async function () {
      expect(await bridge.paused()).to.be.false;
    });
  });

  describe("Token Locking", function () {
    it("Should lock tokens successfully", async function () {
      const amount = ethers.parseEther("100");
      
      // Approve bridge to spend tokens
      await bazigrToken.connect(user).approve(await bridge.getAddress(), amount);
      
      // Lock tokens
      await expect(bridge.connect(user).lockTokens(amount))
        .to.emit(bridge, "TokensLocked")
        .withArgs(user.address, amount, 1, "SEPOLIA");

      // Check bridge balance
      expect(await bridge.getBridgeBalance()).to.equal(amount);
      
      // Check user nonce
      expect(await bridge.getUserNonce(user.address)).to.equal(1);
    });

    it("Should revert if insufficient balance", async function () {
      const amount = ethers.parseEther("2000"); // More than user has
      
      await bazigrToken.connect(user).approve(await bridge.getAddress(), amount);
      
      await expect(bridge.connect(user).lockTokens(amount))
        .to.be.revertedWith("Insufficient balance");
    });

    it("Should revert if insufficient allowance", async function () {
      const amount = ethers.parseEther("100");
      
      await expect(bridge.connect(user).lockTokens(amount))
        .to.be.revertedWith("Insufficient allowance");
    });
  });

  describe("Token Unlocking", function () {
    beforeEach(async function () {
      // Lock some tokens first
      const amount = ethers.parseEther("100");
      await bazigrToken.connect(user).approve(await bridge.getAddress(), amount);
      await bridge.connect(user).lockTokens(amount);
    });

    it("Should unlock tokens successfully", async function () {
      const amount = ethers.parseEther("50");
      const nonce = 1;
      
      await expect(bridge.connect(owner).unlockTokens(user.address, amount, nonce))
        .to.emit(bridge, "TokensUnlocked")
        .withArgs(user.address, amount, nonce, "U2U");

      // Check user balance increased
      expect(await bazigrToken.balanceOf(user.address)).to.be.gt(ethers.parseEther("1000"));
    });

    it("Should revert if nonce already processed", async function () {
      const amount = ethers.parseEther("50");
      const nonce = 1;
      
      // First unlock
      await bridge.connect(owner).unlockTokens(user.address, amount, nonce);
      
      // Try to unlock again with same nonce
      await expect(bridge.connect(owner).unlockTokens(user.address, amount, nonce))
        .to.be.revertedWith("Nonce already processed");
    });

    it("Should revert if not owner", async function () {
      const amount = ethers.parseEther("50");
      const nonce = 1;
      
      await expect(bridge.connect(user).unlockTokens(user.address, amount, nonce))
        .to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Pause/Unpause", function () {
    it("Should pause bridge", async function () {
      await expect(bridge.connect(owner).pauseBridge())
        .to.emit(bridge, "BridgePaused")
        .withArgs(true);
      
      expect(await bridge.paused()).to.be.true;
    });

    it("Should unpause bridge", async function () {
      await bridge.connect(owner).pauseBridge();
      
      await expect(bridge.connect(owner).unpauseBridge())
        .to.emit(bridge, "BridgeUnpaused")
        .withArgs(false);
      
      expect(await bridge.paused()).to.be.false;
    });

    it("Should revert operations when paused", async function () {
      await bridge.connect(owner).pauseBridge();
      
      const amount = ethers.parseEther("100");
      await bazigrToken.connect(user).approve(await bridge.getAddress(), amount);
      
      await expect(bridge.connect(user).lockTokens(amount))
        .to.be.revertedWith("Pausable: paused");
    });
  });

  describe("Emergency Functions", function () {
    beforeEach(async function () {
      // Lock some tokens in bridge
      const amount = ethers.parseEther("100");
      await bazigrToken.connect(user).approve(await bridge.getAddress(), amount);
      await bridge.connect(user).lockTokens(amount);
    });

    it("Should allow emergency withdraw", async function () {
      const amount = ethers.parseEther("50");
      const ownerBalanceBefore = await bazigrToken.balanceOf(owner.address);
      
      await bridge.connect(owner).emergencyWithdraw(amount);
      
      const ownerBalanceAfter = await bazigrToken.balanceOf(owner.address);
      expect(ownerBalanceAfter).to.equal(ownerBalanceBefore + amount);
    });

    it("Should revert emergency withdraw if not owner", async function () {
      const amount = ethers.parseEther("50");
      
      await expect(bridge.connect(user).emergencyWithdraw(amount))
        .to.be.revertedWith("Ownable: caller is not the owner");
    });
  });
});
