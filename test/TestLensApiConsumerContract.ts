import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { type Contract, type Event } from "ethers";
import { ethers } from "hardhat";
import { execSync } from "child_process";

// const RangeValues = {
//   OneTo100: 0,
//   Hundred1To1000: 1,
//   Thousand1To5000: 2,
//   Five001To10000: 3,
//   Five001AndBeyond: 4
// };

async function waitForResponse(consumer: Contract, event: Event) {
  const [, data] = event.args!;
  // Run Phat Function
  const result = execSync(
    `phat-fn run --json dist/index.js -a ${data} https://api-mumbai.lens.dev/`
  ).toString();
  const json = JSON.parse(result);
  const action = ethers.utils.hexlify(
    ethers.utils.concat([new Uint8Array([0]), json.output])
  );
  // Make a response
  const tx = await consumer.rollupU256CondEq(
    // cond
    [],
    [],
    // updates
    [],
    [],
    // actions
    [action]
  );
  const receipt = await tx.wait();
  return receipt.events;
}

describe("Initialize", function () {
  async function beforeEachFunction() {
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount, thirdAccount] = await ethers.getSigners();

    const TestLensApiConsumerContract = await ethers.getContractFactory(
      "TestLensApiConsumerContract"
    );
    const consumer = await TestLensApiConsumerContract.deploy(owner.address);

    return { consumer, owner, otherAccount, thirdAccount };
  }

  describe("Deposit Vote", function () {
    it("Let me Set Token", async function () {
      const { consumer, otherAccount, owner, thirdAccount } = await loadFixture(
        beforeEachFunction
      );
      //await mockToken.mint();
      //console.log("Balance of owner:", await mockToken.balanceOf(owner.address));
      await consumer.placeBet(0, {value: ethers.utils.parseEther("0.001")});
      await consumer.connect(otherAccount).placeBet(1, {value: ethers.utils.parseEther("0.001")});
      await consumer.connect(thirdAccount).placeBet(2, {value: ethers.utils.parseEther("0.001")});

      console.log("Balance of Contract:", await ethers.provider.getBalance(consumer.address));

      expect(await ethers.provider.getBalance(consumer.address)).to.equal(ethers.utils.parseEther("0.003"));
      // await expect(consumer.connect(otherAccount).depositVote(true, {value: ethers.utils.parseEther("1")})).to.be.rejectedWith();
    });
  });

  describe("Execute Bets", function () {
    it("Pays out token to winner", async function () {
      const { consumer, otherAccount, owner, thirdAccount } = await loadFixture(
        beforeEachFunction
      );
      await consumer.placeBet(0, {value: ethers.utils.parseEther("0.001")});
      await consumer.connect(otherAccount).placeBet(1, {value: ethers.utils.parseEther("0.01")});
      await consumer.connect(thirdAccount).placeBet(2, {value: ethers.utils.parseEther("0.01")});
      await consumer.placeBet(3, {value: ethers.utils.parseEther("0.001")});
      await consumer.placeBet(4, {value: ethers.utils.parseEther("0.001")});
      //console.log("Balance of Contract:", await ethers.provider.getBalance(consumer.address));

      await consumer.executeBets(7000);
      console.log("Balance of Contract:", await ethers.provider.getBalance(consumer.address));
      console.log("Balance of owner:", await ethers.provider.getBalance(owner.address));

      // await expect(consumer.connect(otherAccount).depositVote(true, {value: ethers.utils.parseEther("1")})).to.be.rejectedWith();
    });
  });

  describe("TestLensApiConsumerContract", function () {
    it("Push and receive message", async function () {
      const { consumer, otherAccount, owner, thirdAccount } = await loadFixture(
        beforeEachFunction
      );

      // Make a request
      // const profileId = "0x01";
      const profileId = "Jfk6-lZUUvQ";
      const tx = await consumer.request(profileId);
      const receipt = await tx.wait();
      const reqEvents = receipt.events;
      expect(reqEvents![0]).to.have.property("event", "MessageQueued");

      // Wait for Phat Function response
      const respEvents = await waitForResponse(consumer, reqEvents![0]);

      // Check response data
      expect(respEvents[0]).to.have.property("event", "ResponseReceived");
      const [reqId, pair, value] = respEvents[0].args;
      expect(ethers.BigNumber.isBigNumber(reqId)).to.be.true;
      expect(pair).to.equal(profileId);
      expect(ethers.BigNumber.isBigNumber(value)).to.be.true;
    });
  });


});
