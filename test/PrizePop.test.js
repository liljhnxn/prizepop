const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PrizePop Smart Contract - Multi-Round", function () {
  let prizePop;
  let owner;
  let addr1;
  let addr2;
  let addr3;

  beforeEach(async function () {
    [owner, addr1, addr2, addr3] = await ethers.getSigners();
    const PrizePopFactory = await ethers.getContractFactory("PrizePop");
    prizePop = await PrizePopFactory.deploy();
    await prizePop.waitForDeployment();
  });

  describe("1-4: Deployment & Initial State", function () {
    it("1. Successful contract deployment", async function () {
      const address = await prizePop.getAddress();
      expect(address).to.be.properAddress;
    });

    it("2. The deployer becomes the owner", async function () {
      expect(await prizePop.owner()).to.equal(owner.address);
    });

    it("3. The draw starts open at Draw #1", async function () {
      expect(await prizePop.currentDrawId()).to.equal(1);
      // 0 = Open
      expect(await prizePop.drawStatus()).to.equal(0);
      expect(await prizePop.getDrawStatus()).to.equal(0);
      expect(await prizePop.isFinalized()).to.equal(false);
      expect(await prizePop.winner()).to.equal(ethers.ZeroAddress);
    });

    it("4. The initial participant count is zero", async function () {
      expect(await prizePop.getParticipantCount()).to.equal(0);
      const allParticipants = await prizePop.getAllParticipants();
      expect(allParticipants.length).to.equal(0);
    });
  });

  describe("5-8 & 16: Entering the Draw", function () {
    it("5. A wallet can enter the draw", async function () {
      await prizePop.connect(addr1).enterDraw();
      expect(await prizePop.hasEntered(addr1.address)).to.equal(true);
      expect(await prizePop.checkHasEntered(addr1.address)).to.equal(true);
    });

    it("6. A wallet cannot enter twice in the same round", async function () {
      await prizePop.connect(addr1).enterDraw();
      await expect(prizePop.connect(addr1).enterDraw()).to.be.revertedWith(
        "Already entered"
      );
    });

    it("7. The participant count updates correctly", async function () {
      expect(await prizePop.getParticipantCount()).to.equal(0);
      await prizePop.connect(addr1).enterDraw();
      expect(await prizePop.getParticipantCount()).to.equal(1);
      await prizePop.connect(addr2).enterDraw();
      expect(await prizePop.getParticipantCount()).to.equal(2);
    });

    it("8. Participant addresses are recorded correctly", async function () {
      await prizePop.connect(addr1).enterDraw();
      await prizePop.connect(addr2).enterDraw();

      expect(await prizePop.getParticipant(0)).to.equal(addr1.address);
      expect(await prizePop.getParticipant(1)).to.equal(addr2.address);

      const all = await prizePop.getAllParticipants();
      expect(all).to.deep.equal([addr1.address, addr2.address]);
    });

    it("16a. Emits ParticipantEntered event upon entry", async function () {
      await expect(prizePop.connect(addr1).enterDraw())
        .to.emit(prizePop, "ParticipantEntered")
        .withArgs(1, addr1.address);
    });
  });

  describe("9-10 & 16: Closing the Draw", function () {
    it("9. Entries are rejected after the draw closes", async function () {
      await prizePop.connect(addr1).enterDraw();
      await prizePop.connect(owner).closeDraw();

      // Status should be 1 (Closed)
      expect(await prizePop.drawStatus()).to.equal(1);

      await expect(prizePop.connect(addr2).enterDraw()).to.be.revertedWith(
        "Draw is not open"
      );
    });

    it("10. Only the owner can close the draw", async function () {
      await expect(prizePop.connect(addr1).closeDraw()).to.be.revertedWith(
        "Only owner can call this"
      );
    });

    it("16b. Emits DrawClosed event when closed", async function () {
      await expect(prizePop.connect(owner).closeDraw())
        .to.emit(prizePop, "DrawClosed")
        .withArgs(1);
    });
  });

  describe("11-15 & 16: Finalizing the Winner", function () {
    it("11. Finalization is rejected while the draw is open", async function () {
      await prizePop.connect(addr1).enterDraw();
      await expect(prizePop.connect(owner).finalizeWinner()).to.be.revertedWith(
        "Draw must be closed before finalization"
      );
    });

    it("12. Finalization is rejected when there are no participants", async function () {
      await prizePop.connect(owner).closeDraw();
      await expect(prizePop.connect(owner).finalizeWinner()).to.be.revertedWith(
        "No participants in the draw"
      );
    });

    it("13. Only the owner can finalize the winner", async function () {
      await prizePop.connect(addr1).enterDraw();
      await prizePop.connect(owner).closeDraw();
      await expect(prizePop.connect(addr1).finalizeWinner()).to.be.revertedWith(
        "Only owner can call this"
      );
    });

    it("14. The selected winner is a registered participant", async function () {
      await prizePop.connect(addr1).enterDraw();
      await prizePop.connect(addr2).enterDraw();
      await prizePop.connect(addr3).enterDraw();
      await prizePop.connect(owner).closeDraw();

      await prizePop.connect(owner).finalizeWinner();

      const winner = await prizePop.winner();
      const validParticipants = [addr1.address, addr2.address, addr3.address];
      expect(validParticipants).to.include(winner);
      expect(await prizePop.isFinalized()).to.equal(true);
      // Status should be 2 (Completed)
      expect(await prizePop.drawStatus()).to.equal(2);
    });

    it("15. The draw cannot be finalized twice", async function () {
      await prizePop.connect(addr1).enterDraw();
      await prizePop.connect(owner).closeDraw();
      await prizePop.connect(owner).finalizeWinner();

      await expect(prizePop.connect(owner).finalizeWinner()).to.be.revertedWith(
        "Draw must be closed before finalization"
      );
    });

    it("16c. Emits WinnerSelected event with winner address and drawId", async function () {
      await prizePop.connect(addr1).enterDraw();
      await prizePop.connect(owner).closeDraw();

      await expect(prizePop.connect(owner).finalizeWinner())
        .to.emit(prizePop, "WinnerSelected")
        .withArgs(1, addr1.address);
    });
  });

  describe("Multi-Round consecutive draws & History", function () {
    it("Cannot start next round until current round is completed", async function () {
      // Draw 1 is Open
      await expect(prizePop.connect(owner).startNewDraw()).to.be.revertedWith(
        "Current draw is not completed"
      );

      // Draw 1 is Closed
      await prizePop.connect(addr1).enterDraw();
      await prizePop.connect(owner).closeDraw();
      await expect(prizePop.connect(owner).startNewDraw()).to.be.revertedWith(
        "Current draw is not completed"
      );
    });

    it("Only owner can start new draw", async function () {
      await prizePop.connect(addr1).enterDraw();
      await prizePop.connect(owner).closeDraw();
      await prizePop.connect(owner).finalizeWinner();

      await expect(prizePop.connect(addr1).startNewDraw()).to.be.revertedWith(
        "Only owner can call this"
      );
    });

    it("Starting new draw advances round to #2 and resets active participants", async function () {
      await prizePop.connect(addr1).enterDraw();
      await prizePop.connect(owner).closeDraw();
      await prizePop.connect(owner).finalizeWinner();

      const round1Winner = await prizePop.winner();
      expect(round1Winner).to.equal(addr1.address);

      // Start new round
      await expect(prizePop.connect(owner).startNewDraw())
        .to.emit(prizePop, "DrawStarted")
        .withArgs(2);

      expect(await prizePop.currentDrawId()).to.equal(2);
      expect(await prizePop.drawStatus()).to.equal(0); // Open
      expect(await prizePop.getParticipantCount()).to.equal(0);
      expect(await prizePop.winner()).to.equal(ethers.ZeroAddress);
      expect(await prizePop.isFinalized()).to.equal(false);
    });

    it("Previous participants can enter consecutive rounds", async function () {
      // Round 1
      await prizePop.connect(addr1).enterDraw();
      await prizePop.connect(owner).closeDraw();
      await prizePop.connect(owner).finalizeWinner();

      // Round 2
      await prizePop.connect(owner).startNewDraw();

      // addr1 should not be marked as entered in round 2
      expect(await prizePop.checkHasEntered(addr1.address)).to.equal(false);

      // addr1 enters round 2 successfully
      await expect(prizePop.connect(addr1).enterDraw())
        .to.emit(prizePop, "ParticipantEntered")
        .withArgs(2, addr1.address);

      expect(await prizePop.checkHasEntered(addr1.address)).to.equal(true);
      expect(await prizePop.getParticipantCount()).to.equal(1);

      // Cannot enter twice in round 2
      await expect(prizePop.connect(addr1).enterDraw()).to.be.revertedWith(
        "Already entered"
      );
    });

    it("History preserves past rounds data accurately", async function () {
      // Round 1: addr1 enters and wins
      await prizePop.connect(addr1).enterDraw();
      await prizePop.connect(owner).closeDraw();
      await prizePop.connect(owner).finalizeWinner();

      // Round 2: addr2 and addr3 enter
      await prizePop.connect(owner).startNewDraw();
      await prizePop.connect(addr2).enterDraw();
      await prizePop.connect(addr3).enterDraw();
      await prizePop.connect(owner).closeDraw();
      await prizePop.connect(owner).finalizeWinner();

      // Round 3: open
      await prizePop.connect(owner).startNewDraw();

      expect(await prizePop.currentDrawId()).to.equal(3);

      // Verify Round 1 details
      const r1 = await prizePop.getDrawDetails(1);
      expect(r1.id).to.equal(1);
      expect(r1.status).to.equal(2); // Completed
      expect(r1.roundWinner).to.equal(addr1.address);
      expect(r1.participantCount).to.equal(1);

      const r1Participants = await prizePop.getRoundParticipants(1);
      expect(r1Participants).to.deep.equal([addr1.address]);

      // Verify Round 2 details
      const r2 = await prizePop.getDrawDetails(2);
      expect(r2.id).to.equal(2);
      expect(r2.status).to.equal(2); // Completed
      expect([addr2.address, addr3.address]).to.include(r2.roundWinner);
      expect(r2.participantCount).to.equal(2);

      // Verify getDrawHistory returns all 3 rounds
      const history = await prizePop.getDrawHistory();
      expect(history.length).to.equal(3);
      expect(history[0].drawId).to.equal(1);
      expect(history[0].winner).to.equal(addr1.address);
      expect(history[1].drawId).to.equal(2);
      expect(history[2].drawId).to.equal(3);
      expect(history[2].status).to.equal(0); // Open
      expect(history[2].winner).to.equal(ethers.ZeroAddress);
    });
  });
});
