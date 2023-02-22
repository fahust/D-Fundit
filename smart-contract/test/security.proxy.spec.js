const truffleAssert = require("truffle-assertions");
const decodeError = require("../utils/decodeError");

const { increaseTimeTo } = require("../utils/increaseTime");

const SecurityTokenImmutable = artifacts.require("SecurityTokenImmutable");
const ProxySecurityToken = artifacts.require("ProxySecurityToken");
const Factory = artifacts.require("Factory");

const name = "name";
const code = "code";
const assetType = "asset type";
const amount = 10;
const ADDRESS_ZERO = "0x0000000000000000000000000000000000000000";
const pricePerToken = 10;
let rules = {
  freezableAddress: true,
  freezablePartial: true,
  freezablePartialTime: true,
  pausable: true,
  forcableTransfer: true,
  soulBoundSecurityToken: false,
  rulesModifiable: true,
  dayToWithdraw: 0,
  startFundraising: Math.floor(Date.now() / 1000),
  endFundraising: Math.floor(Date.now() / 1000) + 1000000000,
  maxSupply: 10000,
};

function randomIntFromInterval(min, max) {
  // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
}

let date;
// let tokenOnchainID;

contract("SECURITY TOKEN", async accounts => {
  const walletDeployer = accounts[0];
  const walletFirstFounder = accounts[1];
  const walletNewOwner = accounts[2];
  const agent = accounts[8];

  it("SUCCESS : Should deploy smart contract security token", async () => {
    this.SecurityTokenImmutableContract = await SecurityTokenImmutable.new(
      name,
      code,
      rules,
    ); // we deploy contract

    this.ProxySecurityTokenContract = await ProxySecurityToken.new(pricePerToken); // we deploy contract
  });

  describe("ERC-20 MODULE", async () => {
    // it("SUCCESS : Should get name of security token", async () => {
    //   const callName = await this.ProxySecurityTokenContract.name();
    //   assert.equal(callName, name);
    // });

    // it("SUCCESS : Should get code of security token", async () => {
    //   const callCode = await this.ProxySecurityTokenContract.code();
    //   assert.equal(callCode, code);
    // });

    // it("SUCCESS : Should get assetType of security token", async () => {
    //   const callAssetType = await this.ProxySecurityTokenContract.assetType();
    //   assert.equal(callAssetType, assetType);
    // });

    it("ERROR : Should not mint because security token immutable is not linked", async () => {
      await truffleAssert.reverts(
        this.ProxySecurityTokenContract.mint(walletFirstFounder, amount, {
          from: walletFirstFounder,
          value: pricePerToken * amount,
        }),
      );
    });

    it("SUCCESS : Should setAddressProxy of SecurityTokenImmutableContract", async () => {
      await this.SecurityTokenImmutableContract.setAddressProxy(
        this.ProxySecurityTokenContract.address,
      );
    });

    it("ERROR : Should not mint because proxy security token is not linked", async () => {
      await truffleAssert.reverts(
        this.ProxySecurityTokenContract.mint(walletFirstFounder, amount, {
          from: walletFirstFounder,
          value: pricePerToken * amount,
        }),
      );
    });

    it("SUCCESS : Should setSecurityTokenImmutable of ProxySecurityTokenContract", async () => {
      await this.ProxySecurityTokenContract.setSecurityTokenImmutable(
        this.SecurityTokenImmutableContract.address,
      );
    });

    it("SUCCESS : Should get totalSupply of security token", async () => {
      const callTotalSupply = await this.SecurityTokenImmutableContract.totalSupply();
      assert.equal(`${+callTotalSupply}`, 0);
    });

    it("SUCCESS : Should get balance from first founder before mint", async () => {
      const balanceBeforeMint = await this.SecurityTokenImmutableContract.balanceOf(
        walletFirstFounder,
      );
      assert.equal(`${+balanceBeforeMint}`, 0);
    });

    it("SUCCESS : Should get transfers from first founder before mint", async () => {
      const transfers = await this.SecurityTokenImmutableContract.transfers();
      assert.equal(transfers.length, 0);
    });

    it("ERROR : Should not mint with not enough value eth", async () => {
      try {
        await this.ProxySecurityTokenContract.mint(walletDeployer, amount, {
          from: walletFirstFounder,
          value: pricePerToken,
        });
      } catch (error) {
        // const decodedError = await decodeError(error);
        // assert.equal(decodedError.errorFunction, "NotWriter(address)");
        // assert.equal(decodedError.decoded.sender, walletFirstFounder);
      }
    });

    it("SUCCESS : Should mint with deployer account", async () => {
      date = Math.floor(Date.now() / 10000);
      await this.ProxySecurityTokenContract.mint(walletFirstFounder, amount, {
        from: walletFirstFounder,
        value: pricePerToken * amount,
      });
    });

    it("SUCCESS : Should get balance from first founder after mint", async () => {
      const balanceAfterMint = await this.SecurityTokenImmutableContract.balanceOf(
        walletFirstFounder,
      );
      assert.equal(`${+balanceAfterMint}`, amount);
    });

    it("SUCCESS : Should get transfers after mint of first founder", async () => {
      const transfers = await this.SecurityTokenImmutableContract.transfers();
      assert.equal(transfers.length, 1);
      assert.equal(transfers[0].transferType, "mint");
      assert.equal(transfers[0].from, ADDRESS_ZERO);
      assert.equal(transfers[0].to, walletFirstFounder);
      assert.equal(transfers[0].amount, amount);
      // assert.equal(Math.floor(transfers[0].date / 10), date);
    });

    it("ERROR : Should not burn with first founder account more of balance", async () => {
      try {
        await this.ProxySecurityTokenContract.burn(walletFirstFounder, amount + 1, {
          from: walletFirstFounder,
        });
      } catch (error) {
        // const decodedError = await decodeError(error);
        // assert.equal(decodedError.errorFunction, "NotWriter(address)");
        // assert.equal(decodedError.decoded.sender, walletFirstFounder);
      }
    });

    it("SUCCESS : Should randomly mint and burn some token with two other account", async () => {
      for (let index = 3; index < 7; index++) {
        let random = randomIntFromInterval(1, 10);
        await this.ProxySecurityTokenContract.mint(accounts[index], amount * random, {
          from: accounts[index],
          value: pricePerToken * amount * random,
        });

        await this.ProxySecurityTokenContract.burn(
          accounts[index],
          amount * random - randomIntFromInterval(1, 10),
          {
            from: accounts[index],
          },
        );
      }
    });

    it("SUCCESS : Should burn with deployer account", async () => {
      const totalSupply = await this.SecurityTokenImmutableContract.totalSupply();
      const tokenBalanceWalletBeforeBurn =
        await this.SecurityTokenImmutableContract.balanceOf(walletFirstFounder);
      const contractBalance = await web3.eth.getBalance(
        this.SecurityTokenImmutableContract.address,
      );
      const ethBalanceWalletBeforeBurn = await web3.eth.getBalance(walletFirstFounder);

      console.log("tokenBalanceWalletBeforeBurn", +tokenBalanceWalletBeforeBurn);
      console.log("ethBalanceWalletBeforeBurn", ethBalanceWalletBeforeBurn + "");
      console.log("totalSupply", +totalSupply);
      console.log("contractBalance", +contractBalance);
      console.log("amount", +amount);

      const currentValueOneToken = (+contractBalance * 100) / (+totalSupply * 100);

      console.log("current value", +currentValueOneToken);

      const refoundableOffChain = Math.floor(currentValueOneToken * amount);

      console.log("refoundableOffChain", +refoundableOffChain);

      const refoundableOnChain = await this.ProxySecurityTokenContract.refoundable(
        amount,
        {
          from: walletDeployer,
        },
      );

      assert.equal(+refoundableOnChain, +refoundableOffChain);

      console.log("refoundableOnChain", +refoundableOnChain);

      await this.ProxySecurityTokenContract.burn(walletFirstFounder, amount, {
        from: walletDeployer,
      });

      const tokenBalanceWalletAfterBurn =
        await this.SecurityTokenImmutableContract.balanceOf(walletFirstFounder);

      const ethBalanceWalletAfterBurn = await web3.eth.getBalance(walletFirstFounder);

      console.log("tokenBalanceWalletAfterBurn", +tokenBalanceWalletAfterBurn);
      console.log("ethBalanceWalletAfterBurn", ethBalanceWalletAfterBurn + "");

      assert.equal(
        +ethBalanceWalletAfterBurn - refoundableOnChain,
        +ethBalanceWalletBeforeBurn,
      );

      date = Math.floor(Date.now() / 10000);
    });

    it("SUCCESS : Should get transfers after burn of first founder", async () => {
      const transfers = await this.SecurityTokenImmutableContract.transfers();
      assert.equal(transfers.length, 10);

      assert.equal(transfers[0].transferType, "mint");
      assert.equal(transfers[0].from, ADDRESS_ZERO);
      assert.equal(transfers[0].to, walletFirstFounder);
      assert.equal(transfers[0].amount, amount);

      assert.equal(transfers[9].transferType, "burn");
      assert.equal(transfers[9].from, walletFirstFounder);
      assert.equal(transfers[9].to, ADDRESS_ZERO);
      assert.equal(transfers[9].amount, amount);
      // assert.equal(Math.floor(transfers[1].date / 10), date);
    });

    it("SUCCESS : Should transfer owner ship", async () => {
      const ownerBeforeTransferOwnership = await this.ProxySecurityTokenContract.owner();
      assert.equal(ownerBeforeTransferOwnership, walletDeployer);

      await this.ProxySecurityTokenContract.transferOwnership(walletNewOwner);
      await this.SecurityTokenImmutableContract.transferOwnership(walletNewOwner);

      await this.SecurityTokenImmutableContract.increaseAllowance(
        walletNewOwner,
        "20000000000",
      );

      await this.SecurityTokenImmutableContract.increaseAllowance(
        walletDeployer,
        "20000000000",
      );

      const ownerAfterTransferOwnership = await this.ProxySecurityTokenContract.owner();
      assert.equal(ownerAfterTransferOwnership, walletNewOwner);
    });

    it("ERROR : Should not transfer with walletDeployer no balance", async () => {
      const canTransfer = await this.ProxySecurityTokenContract.canTransfer(
        walletNewOwner,
        walletNewOwner,
        walletFirstFounder,
        amount,
      );
      assert.equal(canTransfer, "0x52");
      await truffleAssert.reverts(
        this.ProxySecurityTokenContract.transfer(walletFirstFounder, amount, {
          from: walletNewOwner,
        }),
      );
    });

    it("SUCCESS : Should mint with new owner account to new owner", async () => {
      await this.ProxySecurityTokenContract.mint(walletNewOwner, amount, {
        from: walletNewOwner,
        value: pricePerToken * amount,
      });
      const balance = await this.SecurityTokenImmutableContract.balanceOf(walletNewOwner);
      assert.equal(`${+balance}`, amount);
    });

    it("SUCCESS : Should transfer with walletDeployer", async () => {
      const canTransfer = await this.ProxySecurityTokenContract.canTransfer(
        walletNewOwner,
        walletNewOwner,
        walletDeployer,
        amount,
      );
      assert.equal(canTransfer, "0x51");

      await this.ProxySecurityTokenContract.transfer(walletDeployer, amount, {
        from: walletNewOwner,
      });
      const balance = await this.SecurityTokenImmutableContract.balanceOf(walletDeployer);
      assert.equal(`${+balance}`, amount);
    });

    it("SUCCESS : Should pause with walletNewOwner", async () => {
      await this.SecurityTokenImmutableContract.pause(
        Math.floor(Date.now() / 1000) + 100,
        {
          from: walletNewOwner,
        },
      );
    });

    it("ERROR : Should not transfer with new owner account because contract is paused", async () => {
      const canTransfer = await this.ProxySecurityTokenContract.canTransfer(
        walletNewOwner,
        walletDeployer,
        walletFirstFounder,
        amount,
      );
      assert.equal(canTransfer, "0x54");

      await truffleAssert.reverts(
        this.ProxySecurityTokenContract.transferFrom(
          walletDeployer,
          walletFirstFounder,
          amount,
          {
            from: walletNewOwner,
          },
        ),
      );
    });

    it("ERROR : Should not mint with walletNewOwner account because contract is paused", async () => {
      await truffleAssert.reverts(
        this.ProxySecurityTokenContract.mint(walletFirstFounder, amount, {
          from: walletNewOwner,
          value: pricePerToken * amount,
        }),
      );
    });

    it("ERROR : Should not burn with walletNewOwner account because contract is paused", async () => {
      await truffleAssert.reverts(
        this.ProxySecurityTokenContract.burn(walletFirstFounder, amount, {
          from: walletNewOwner,
        }),
      );
    });

    it("SUCCESS : Should unpause with walletNewOwner", async () => {
      await this.SecurityTokenImmutableContract.unpause({
        from: walletNewOwner,
      });
    });

    it("SUCCESS : Should transfer with new owner account", async () => {
      const canTransfer = await this.ProxySecurityTokenContract.canTransfer(
        walletNewOwner,
        walletDeployer,
        walletFirstFounder,
        amount,
      );
      assert.equal(canTransfer, "0x51");

      await this.ProxySecurityTokenContract.transferFrom(
        walletDeployer,
        walletFirstFounder,
        amount,
        {
          from: walletNewOwner,
        },
      );
      const balance = await this.SecurityTokenImmutableContract.balanceOf(
        walletFirstFounder,
      );
      assert.equal(`${+balance}`, amount);
    });

    it("SUCCESS : Should get transfers after burn of first founder", async () => {
      const transfers = await this.SecurityTokenImmutableContract.transfers({
        from: walletNewOwner,
      });
      assert.equal(transfers.length, 13);

      assert.equal(transfers[0].transferType, "mint");
      assert.equal(transfers[0].from, ADDRESS_ZERO);
      assert.equal(transfers[0].to, walletFirstFounder);
      assert.equal(transfers[0].amount, amount);

      assert.equal(transfers[9].transferType, "burn");
      assert.equal(transfers[9].from, walletFirstFounder);
      assert.equal(transfers[9].to, ADDRESS_ZERO);
      assert.equal(transfers[9].amount, amount);

      assert.equal(transfers[10].transferType, "mint");
      assert.equal(transfers[10].from, ADDRESS_ZERO);
      assert.equal(transfers[10].to, walletNewOwner);
      assert.equal(transfers[10].amount, amount);

      assert.equal(transfers[11].transferType, "transfer");
      assert.equal(transfers[11].from, walletNewOwner);
      assert.equal(transfers[11].to, walletDeployer);
      assert.equal(transfers[11].amount, amount);

      assert.equal(transfers[12].transferType, "transfer");
      assert.equal(transfers[12].from, walletDeployer);
      assert.equal(transfers[12].to, walletFirstFounder);
      assert.equal(transfers[12].amount, amount);
    });
  });

  describe("FREEZING-ADDRESS MODULE", async () => {
    it("ERROR : Should not freeze address with not owner or agent address", async () => {
      await truffleAssert.reverts(
        this.ProxySecurityTokenContract.setAddressFrozen(walletFirstFounder, false, {
          from: walletDeployer,
        }),
      );
    });

    it("SUCCESS : Should freeze address", async () => {
      await this.ProxySecurityTokenContract.setAddressFrozen(walletFirstFounder, true, {
        from: walletNewOwner,
      });
    });

    it("SUCCESS : Should know if address it frozen", async () => {
      const isFrozen = await this.ProxySecurityTokenContract.isFrozen(
        walletFirstFounder,
        {
          from: walletNewOwner,
        },
      );
      assert.equal(isFrozen, true);
    });

    it("ERROR : Should not transfer with walletFirstFounder because freezed address", async () => {
      const canTransfer = await this.ProxySecurityTokenContract.canTransfer(
        walletFirstFounder,
        walletFirstFounder,
        walletDeployer,
        amount,
      );
      assert.equal(canTransfer, "0x5a");

      await truffleAssert.reverts(
        this.ProxySecurityTokenContract.transfer(walletDeployer, amount, {
          from: walletFirstFounder,
        }),
        //'wallet is frozen',
      );
      const balance = await this.SecurityTokenImmutableContract.balanceOf(
        walletFirstFounder,
      );
      assert.equal(`${+balance}`, amount);
    });

    it("ERROR : Should not transferFrom with new owner account to freezed account", async () => {
      const canTransfer = await this.ProxySecurityTokenContract.canTransfer(
        walletNewOwner,
        walletNewOwner,
        walletFirstFounder,
        amount,
      );
      assert.equal(canTransfer, "0x52");

      await truffleAssert.reverts(
        this.ProxySecurityTokenContract.transferFrom(
          walletNewOwner,
          walletFirstFounder,
          amount,
          {
            from: walletNewOwner,
          },
        ),
        //'wallet is frozen',
      );
    });

    it("ERROR : Should not transferFrom with new owner account from freezed account", async () => {
      await truffleAssert.reverts(
        this.ProxySecurityTokenContract.transferFrom(
          walletFirstFounder,
          walletNewOwner,
          amount,
          {
            from: walletNewOwner,
          },
        ),
        //'wallet is frozen',
      );
    });

    it("SUCCESS : Should unfreeze address by batch", async () => {
      await this.ProxySecurityTokenContract.batchSetAddressFrozen(
        [walletFirstFounder],
        [false],
        {
          from: walletNewOwner,
        },
      );
    });

    it("SUCCESS : Should transfer with walletFirstFounder", async () => {
      const canTransfer = await this.ProxySecurityTokenContract.canTransfer(
        walletFirstFounder,
        walletFirstFounder,
        walletDeployer,
        amount,
      );
      assert.equal(canTransfer, "0x51");

      await this.ProxySecurityTokenContract.transfer(walletDeployer, amount, {
        from: walletFirstFounder,
      });
      const balance = await this.SecurityTokenImmutableContract.balanceOf(walletDeployer);
      assert.equal(`${+balance}`, amount);
    });

    it("SUCCESS : Should transferFrom with new owner", async () => {
      await this.ProxySecurityTokenContract.transferFrom(
        walletDeployer,
        walletFirstFounder,
        amount,
        {
          from: walletNewOwner,
        },
      );
    });
  });

  describe("FREEZING-PARTIAL MODULE", async () => {
    it("ERROR : Should not freeze partial tokens address more than balance", async () => {
      await truffleAssert.reverts(
        this.ProxySecurityTokenContract.freezePartialTokens(
          walletFirstFounder,
          amount + 1,
          {
            from: walletNewOwner,
          },
        ),
        //'Amount exceeds available balance',
      );
    });

    it("SUCCESS : Should freeze partial tokens walletFirstFounder", async () => {
      await this.ProxySecurityTokenContract.freezePartialTokens(
        walletFirstFounder,
        amount / 2,
        {
          from: walletNewOwner,
        },
      );
    });

    it("SUCCESS : Should get freezed partial tokens on walletFirstFounder", async () => {
      const getFrozenTokens = await this.ProxySecurityTokenContract.getFrozenTokens(
        walletFirstFounder,
        {
          from: walletNewOwner,
        },
      );
      assert.equal(`${+getFrozenTokens}`, amount / 2);
    });

    it("ERROR : Should not transfer with walletFirstFounder with partial freezed token", async () => {
      const canTransfer = await this.ProxySecurityTokenContract.canTransfer(
        walletFirstFounder,
        walletFirstFounder,
        walletDeployer,
        amount,
      );
      assert.equal(canTransfer, "0x55");

      await truffleAssert.reverts(
        this.ProxySecurityTokenContract.transfer(walletDeployer, amount, {
          from: walletFirstFounder,
        }),
        //'Insufficient Balance',
      );

      const balance = await this.SecurityTokenImmutableContract.balanceOf(
        walletFirstFounder,
      );
      assert.equal(`${+balance}`, amount);
    });

    it("SUCCESS : Should transfer with walletFirstFounder", async () => {
      await this.ProxySecurityTokenContract.transfer(walletDeployer, amount / 2, {
        from: walletFirstFounder,
      });

      const balanceWalletDeployer = await this.SecurityTokenImmutableContract.balanceOf(
        walletDeployer,
      );
      assert.equal(`${+balanceWalletDeployer}`, amount / 2);

      const balanceWalletFirstFounder =
        await this.SecurityTokenImmutableContract.balanceOf(walletFirstFounder);
      assert.equal(`${+balanceWalletFirstFounder}`, amount / 2);

      await this.ProxySecurityTokenContract.transfer(walletFirstFounder, amount / 2, {
        from: walletDeployer,
      });
    });

    it("SUCCESS : Should batch freeze partial tokens walletFirstFounder", async () => {
      const balanceOf = await this.SecurityTokenImmutableContract.balanceOf(
        walletFirstFounder,
      );
      const getFrozenTokens = await this.ProxySecurityTokenContract.getFrozenTokens(
        walletFirstFounder,
      );
      assert.equal(`${`${+balanceOf}` - +getFrozenTokens}`, amount / 2);

      await this.ProxySecurityTokenContract.batchFreezePartialTokens(
        [walletFirstFounder],
        [`${`${+balanceOf}` - +getFrozenTokens}`],
        {
          from: walletNewOwner,
        },
      );
    });

    it("ERROR : Should not transferFrom with new owner with partial freezed token", async () => {
      const canTransfer = await this.ProxySecurityTokenContract.canTransfer(
        walletNewOwner,
        walletFirstFounder,
        walletDeployer,
        1,
      );
      assert.equal(canTransfer, "0x55");

      await truffleAssert.reverts(
        this.ProxySecurityTokenContract.transferFrom(
          walletFirstFounder,
          walletDeployer,
          1,
          {
            from: walletNewOwner,
          },
        ),
      );
    });

    it("SUCCESS : Should batch freeze partial tokens walletFirstFounder", async () => {
      await this.ProxySecurityTokenContract.batchUnfreezePartialTokens(
        [walletFirstFounder],
        [amount / 2],
        {
          from: walletNewOwner,
        },
      );
    });

    it("SUCCESS : Should freeze partial tokens walletFirstFounder", async () => {
      await this.ProxySecurityTokenContract.unfreezePartialTokens(
        walletFirstFounder,
        amount / 2,
        {
          from: walletNewOwner,
        },
      );

      const getFrozenTokens = await this.ProxySecurityTokenContract.getFrozenTokens(
        walletFirstFounder,
      );

      assert.equal(`${+getFrozenTokens}`, 0);
    });

    // it('ERROR : Should force transfer', async () => {
    //   await truffleAssert.reverts(
    //     this.ProxySecurityTokenContract.forcedTransfer(
    //       walletFirstFounder,
    //       walletNewOwner,
    //       amount,
    //       {
    //         from: agent,
    //       },
    //     ),
    //     'Transfer not possible',
    //   );
    // });
  });

  describe("FORCE MODULE", async () => {
    it("SUCCESS : add agent into identity registry and identity registrery storage", async () => {
      await this.ProxySecurityTokenContract.addAgent(agent, { from: walletNewOwner });

      const isAgentToken = await this.ProxySecurityTokenContract.isAgent(agent, {
        from: walletNewOwner,
      });
      assert.equal(isAgentToken, true);
    });

    it("SUCCESS : Should force transfer", async () => {
      const canTransfer = await this.ProxySecurityTokenContract.canTransfer(
        agent,
        walletFirstFounder,
        walletDeployer,
        amount,
      );
      assert.equal(canTransfer, "0x51");

      await this.ProxySecurityTokenContract.forceTransfer(
        walletFirstFounder,
        walletDeployer,
        amount,
        {
          from: agent,
        },
      );
    });
  });

  describe("FREEZING-PERIOD MODULE", async () => {
    const amountRandom = randomIntFromInterval(1, amount);
    const dayWaitedRandom = randomIntFromInterval(1, amountRandom);
    const dayEndRandom = randomIntFromInterval(
      amount * 2,
      amount * 2 + randomIntFromInterval(0, amount * 4),
    );
    let percentExpected;
    let firstTransfer;

    it("ERROR : Should not set freezed tokens period with amount beyond to balance of wallet deployer", async () => {
      const now = new Date();
      const someDaysLater = new Date();
      someDaysLater.setDate(now.getDate() + dayEndRandom);

      await truffleAssert.reverts(
        this.ProxySecurityTokenContract.setFreezedTokensPeriod(
          Math.floor(+now / 1000),
          Math.floor(+someDaysLater / 1000),
          amount + 1,
          walletDeployer,
          {
            from: agent,
          },
        ),
        //'Amount is upper than balance of user',
      );
    });

    it(`SUCCESS : Should set freezed tokens period with start date now and end date in ${dayEndRandom} day for ${amountRandom} tokens freezed`, async () => {
      const now = new Date();
      const someDaysLater = new Date();
      someDaysLater.setDate(now.getDate() + dayEndRandom);

      await this.ProxySecurityTokenContract.setFreezedTokensPeriod(
        Math.floor(+now / 1000),
        Math.floor(+someDaysLater / 1000),
        amountRandom,
        walletDeployer,
        {
          from: agent,
        },
      );
    });

    it("SUCCESS : Should get my freezed tokens period and check expected parameter", async () => {
      const now = new Date();
      const someDaysLater = new Date();
      someDaysLater.setDate(now.getDate() + dayEndRandom);

      const myFreezedTokensPeriod =
        await this.ProxySecurityTokenContract.myFreezedTokensPeriod({
          from: walletDeployer,
        });

      assert.equal(
        Math.floor(myFreezedTokensPeriod.startTime / 100),
        Math.floor(+now / 100000),
      );
      assert.equal(
        Math.floor(myFreezedTokensPeriod.endTime / 100),
        Math.floor(+someDaysLater / 100000),
      );
      assert.equal(myFreezedTokensPeriod.amountFreezed, amountRandom);
    });

    it(`SUCCESS : Should increase block timestamp to ${dayWaitedRandom} day`, async () => {
      const now = new Date();
      const someDaysLater = new Date();
      someDaysLater.setDate(now.getDate() + dayWaitedRandom);

      const blockTimeStampBeforeIncreaseTime =
        await this.ProxySecurityTokenContract._now();
      assert.equal(
        Math.floor(+blockTimeStampBeforeIncreaseTime / 100),
        Math.floor(+now / 100000),
      );

      await increaseTimeTo(Math.floor(+someDaysLater / 1000));

      const blockTimeStampAfterIncreaseTime =
        await this.ProxySecurityTokenContract._now();
      assert.equal(
        Math.floor(+blockTimeStampAfterIncreaseTime / 100),
        Math.floor(+someDaysLater / 100000),
      );
    });

    it("SUCCESS : Should get unlockable tokens period off chain and compare with on chain result", async () => {
      const myFreezedTokensPeriod =
        await this.ProxySecurityTokenContract.myFreezedTokensPeriod({
          from: walletDeployer,
        });
      const now = await this.ProxySecurityTokenContract._now();
      const diff = myFreezedTokensPeriod.endTime - myFreezedTokensPeriod.startTime;
      const timeBehind = now - myFreezedTokensPeriod.startTime;
      percentExpected = (timeBehind * 100) / diff;

      const unlockableTokensPeriod =
        await this.ProxySecurityTokenContract.unlockableTokensPeriod({
          from: walletDeployer,
        });
      assert.equal(
        Math.floor(amountRandom * (Math.floor(percentExpected) / 100)),
        +unlockableTokensPeriod,
      );
    });

    it("ERROR : Should compare result of eligibleBalanceOf", async () => {
      const eligibleBalanceOf = await this.ProxySecurityTokenContract.eligibleBalanceOf(
        walletDeployer,
      );
      const myFreezedTokensPeriod =
        await this.ProxySecurityTokenContract.myFreezedTokensPeriod({
          from: walletDeployer,
        });
      const balanceOf = await this.SecurityTokenImmutableContract.balanceOf(
        walletDeployer,
      );
      assert.equal(+balanceOf - myFreezedTokensPeriod.amountFreezed, +eligibleBalanceOf);
    });

    it("ERROR : Should not transfer with walletFirstFounder with partial freezed token because upper to unlocked balance", async () => {
      const canTransfer = await this.ProxySecurityTokenContract.canTransfer(
        walletDeployer,
        walletDeployer,
        walletFirstFounder,
        amount,
      );
      assert.equal(canTransfer, "0x55");

      await truffleAssert.reverts(
        this.ProxySecurityTokenContract.transfer(walletFirstFounder, amount, {
          from: walletDeployer,
        }),
        //'Insufficient Balance',
      );

      const balance = await this.SecurityTokenImmutableContract.balanceOf(walletDeployer);
      assert.equal(+balance, amount);
    });

    it("ERROR : Should not transferFrom with walletDeployer account 1 more of eligibleBalanceOf", async () => {
      const eligibleBalanceOf = await this.ProxySecurityTokenContract.eligibleBalanceOf(
        walletDeployer,
      );
      assert.equal(+eligibleBalanceOf, amount - amountRandom);

      const canTransfer = await this.ProxySecurityTokenContract.canTransfer(
        walletDeployer,
        walletDeployer,
        walletFirstFounder,
        amount - amountRandom + 1,
      );
      assert.equal(canTransfer, "0x55");

      await truffleAssert.reverts(
        this.ProxySecurityTokenContract.transferFrom(
          walletDeployer,
          walletFirstFounder,
          amount - amountRandom + 1,
          {
            from: walletDeployer,
          },
        ),
        //'Insufficient Balance',
      );
    });

    it(`SUCCESS : Should redeem of tokens in freeze-period`, async () => {
      await this.ProxySecurityTokenContract.redeemFreezedTokens({
        from: walletDeployer,
      });
    });

    it("SUCCESS : Should get my freezed tokens period after redeem", async () => {
      const myFreezedTokensPeriod =
        await this.ProxySecurityTokenContract.myFreezedTokensPeriod({
          from: walletDeployer,
        });

      assert.equal(
        Math.floor(amountRandom * (Math.floor(percentExpected) / 100)),
        amountRandom - +myFreezedTokensPeriod.amountFreezed,
      );
    });

    it("SUCCESS : Should transfer with walletFirstFounder with partial redeemed freezed tokens", async () => {
      const myFreezedTokensPeriod =
        await this.ProxySecurityTokenContract.myFreezedTokensPeriod({
          from: walletDeployer,
        });
      firstTransfer = amountRandom - +myFreezedTokensPeriod.amountFreezed;
      await this.ProxySecurityTokenContract.transfer(walletFirstFounder, firstTransfer, {
        from: walletDeployer,
      });

      const balance = await this.SecurityTokenImmutableContract.balanceOf(walletDeployer);
      assert.equal(
        +balance,
        amount - (amountRandom - +myFreezedTokensPeriod.amountFreezed),
      );
    });

    it(`SUCCESS : Should increase block timestamp beyond end time (${dayEndRandom} day) for totaly redeem freezing period`, async () => {
      const now = new Date();
      const someDaysLater = new Date();
      someDaysLater.setDate(now.getDate() + dayEndRandom);

      await increaseTimeTo(Math.floor(+someDaysLater / 1000));
    });

    it("SUCCESS : Should redeem remaining freezed tokens period", async () => {
      await this.ProxySecurityTokenContract.redeemFreezedTokens({
        from: walletDeployer,
      });
    });

    it("SUCCESS : Should get my freezed tokens period and expected not remaining token freezed", async () => {
      const myFreezedTokensPeriod =
        await this.ProxySecurityTokenContract.myFreezedTokensPeriod({
          from: walletDeployer,
        });

      assert.equal(+myFreezedTokensPeriod.amountFreezed, 0);
    });

    it("ERROR : Should not redeem freezed tokens period but no token to unfreeze", async () => {
      await truffleAssert.reverts(
        this.ProxySecurityTokenContract.redeemFreezedTokens({
          from: walletDeployer,
        }),
        //'No token to unfreeze',
      );
    });

    it("SUCCESS : Should transfer remaining tokens with walletFirstFounder after unfreezed totality token", async () => {
      const balanceBeforeLastTransfer =
        await this.SecurityTokenImmutableContract.balanceOf(walletFirstFounder);

      await this.ProxySecurityTokenContract.transfer(
        walletFirstFounder,
        amount - balanceBeforeLastTransfer,
        {
          from: walletDeployer,
        },
      );

      const balanceAfterLastTransfer =
        await this.SecurityTokenImmutableContract.balanceOf(walletFirstFounder);
      assert.equal(`${+balanceAfterLastTransfer}`, amount);
    });
  });

  describe("BURN ALL", async () => {
    it("SUCCESS : Should burn with deployer account", async () => {
      const totalSupplyBeforeAllBurn =
        await this.SecurityTokenImmutableContract.totalSupply();
      const contractBalanceBeforeAllBurn = await web3.eth.getBalance(
        this.SecurityTokenImmutableContract.address,
      );
      console.log("totalSupplyBeforeAllBurn", +totalSupplyBeforeAllBurn);
      console.log("contractBalanceBeforeAllBurn", +contractBalanceBeforeAllBurn);
      for (let index = 0; index < accounts.length; index++) {
        const balance = await this.SecurityTokenImmutableContract.balanceOf(
          accounts[index],
        );
        if (+balance > 0)
          await this.ProxySecurityTokenContract.burn(accounts[index], +balance, {
            from: accounts[index],
          });
      }
      const totalSupplyAfterAllBurn =
        await this.SecurityTokenImmutableContract.totalSupply();
      const contractBalanceAfterAllBurn = await web3.eth.getBalance(
        this.SecurityTokenImmutableContract.address,
      );
      console.log("totalSupplyAfterAllBurn", +totalSupplyAfterAllBurn);
      console.log("contractBalanceAfterAllBurn", +contractBalanceAfterAllBurn);
    });
  });

  describe("WITHDRAW OWNER", async () => {
    it("ERROR : Should not withdraw because not enough eth", async () => {
      await truffleAssert.reverts(
        this.ProxySecurityTokenContract.withdraw(amount, walletNewOwner, {
          from: walletNewOwner,
        }),
      );
    });

    it("ERROR : Should not withdraw because not owner of contract", async () => {
      await truffleAssert.reverts(
        this.ProxySecurityTokenContract.withdraw(amount, walletDeployer, {
          from: walletDeployer,
        }),
      );
    });

    it("SUCCESS : Should randomly mint and burn some token with two other account", async () => {
      for (let index = 3; index < 7; index++) {
        let random = randomIntFromInterval(1, 10);
        await this.ProxySecurityTokenContract.mint(accounts[index], amount * random, {
          from: accounts[index],
          value: pricePerToken * amount * random,
        });

        await this.ProxySecurityTokenContract.burn(
          accounts[index],
          amount * random - randomIntFromInterval(1, 10),
          {
            from: accounts[index],
          },
        );
      }
    });

    it("SUCCESS : Should withdraw because not owner of contract", async () => {
      const contractBalanceBeforeWithdraw = await web3.eth.getBalance(
        this.ProxySecurityTokenContract.address,
      );
      const walletFirstFounderBeforeWithdraw = await web3.eth.getBalance(
        walletFirstFounder,
      );
      await this.ProxySecurityTokenContract.withdraw(
        +contractBalanceBeforeWithdraw,
        walletFirstFounder,
        {
          from: walletNewOwner,
        },
      );

      const contractBalanceAfterWithdraw = await web3.eth.getBalance(
        this.ProxySecurityTokenContract.address,
      );
      const walletFirstFounderAfterWithdraw = await web3.eth.getBalance(
        walletFirstFounder,
      );

      assert.equal(
        +walletFirstFounderAfterWithdraw,
        +walletFirstFounderBeforeWithdraw + +contractBalanceBeforeWithdraw,
      );

      assert.equal(contractBalanceAfterWithdraw, 0);
    });

    it("SUCCESS : Should burn all remaining balances with deployer account", async () => {
      const totalSupplyBeforeAllBurn =
        await this.SecurityTokenImmutableContract.totalSupply();
      const contractBalanceBeforeAllBurn = await web3.eth.getBalance(
        this.ProxySecurityTokenContract.address,
      );
      console.log("totalSupplyBeforeAllBurn", +totalSupplyBeforeAllBurn);
      console.log("contractBalanceBeforeAllBurn", +contractBalanceBeforeAllBurn);
      for (let index = 0; index < accounts.length; index++) {
        const balance = await this.SecurityTokenImmutableContract.balanceOf(
          accounts[index],
        );
        if (+balance > 0)
          await this.ProxySecurityTokenContract.burn(accounts[index], +balance, {
            from: accounts[index],
          });
      }
      const totalSupplyAfterAllBurn =
        await this.SecurityTokenImmutableContract.totalSupply();
      const contractBalanceAfterAllBurn = await web3.eth.getBalance(
        this.ProxySecurityTokenContract.address,
      );
      console.log("totalSupplyAfterAllBurn", +totalSupplyAfterAllBurn);
      console.log("contractBalanceAfterAllBurn", +contractBalanceAfterAllBurn);
    });

    it("SUCCESS : Should randomly mint and burn some token with two other account, then withdraw only 50 % of balance contract", async () => {
      for (let index = 3; index < 7; index++) {
        let random = randomIntFromInterval(1, 10);
        await this.ProxySecurityTokenContract.mint(accounts[index], amount * random, {
          from: accounts[index],
          value: pricePerToken * amount * random,
        });

        await this.ProxySecurityTokenContract.burn(
          accounts[index],
          amount * random - randomIntFromInterval(1, 10),
          {
            from: accounts[index],
          },
        );
      }

      const contractBalanceBeforeWithdraw = await web3.eth.getBalance(
        this.ProxySecurityTokenContract.address,
      );
      await this.ProxySecurityTokenContract.withdraw(
        Math.floor(+contractBalanceBeforeWithdraw / 2),
        walletFirstFounder,
        {
          from: walletNewOwner,
        },
      );
    });

    it("SUCCESS : Should burn all remaining balances with deployer account", async () => {
      const totalSupplyBeforeAllBurn =
        await this.SecurityTokenImmutableContract.totalSupply();
      const contractBalanceBeforeAllBurn = await web3.eth.getBalance(
        this.ProxySecurityTokenContract.address,
      );
      console.log("totalSupplyBeforeAllBurn", +totalSupplyBeforeAllBurn);
      console.log("contractBalanceBeforeAllBurn", +contractBalanceBeforeAllBurn);
      for (let index = 0; index < accounts.length; index++) {
        const balance = await this.SecurityTokenImmutableContract.balanceOf(
          accounts[index],
        );
        if (+balance > 0) {
          const refoundableOnChain = await this.ProxySecurityTokenContract.refoundable(
            balance,
            {
              from: walletDeployer,
            },
          );
          console.log("refoundable account [" + index + "]", +refoundableOnChain);
          console.log("balance account [" + index + "]", +balance);
          await this.ProxySecurityTokenContract.burn(accounts[index], +balance, {
            from: accounts[index],
          });
        }
      }
      const totalSupplyAfterAllBurn =
        await this.SecurityTokenImmutableContract.totalSupply();
      const contractBalanceAfterAllBurn = await web3.eth.getBalance(
        this.ProxySecurityTokenContract.address,
      );
      console.log("totalSupplyAfterAllBurn", +totalSupplyAfterAllBurn);
      console.log("contractBalanceAfterAllBurn", +contractBalanceAfterAllBurn);
    });
  });

  describe("FACTORY", async () => {
    it("SUCCESS : Deploy contract factory", async () => {
      this.FactoryContract = await Factory.new(); // we deploy contract
    });
    it("SUCCESS : Add security contract to factory", async () => {
      await this.FactoryContract.addSecurityToken(
        this.SecurityTokenImmutableContract.address,
      );
    });
    it("SUCCESS : list security tokens contract", async () => {
      const list = await this.FactoryContract.listSecurityTokens(0);
      assert.equal(list.length, 1);
      assert.equal(list[0], this.SecurityTokenImmutableContract.address);
    });
    it("SUCCESS : count security tokens contract", async () => {
      const count = await this.FactoryContract.getCountSecurityToken();
      assert.equal(count, 1);
    });
  });

  describe("RULES", async () => {
    it("SUCCESS : Get rules", async () => {
      rules = await this.SecurityTokenImmutableContract.getRules({
        from: walletNewOwner,
      });
      console.log(rules);
    });
    it("SUCCESS : Set rules, soul bound security token", async () => {
      await this.ProxySecurityTokenContract.mint(walletFirstFounder, amount, {
        from: walletFirstFounder,
        value: pricePerToken * amount,
      });

      rules = {
        ...rules,
        soulBoundSecurityToken: true,
      };

      await this.SecurityTokenImmutableContract.setRules(rules, {
        from: walletNewOwner,
      });

      const canTransfer = await this.ProxySecurityTokenContract.canTransfer(
        walletFirstFounder,
        walletFirstFounder,
        walletDeployer,
        amount,
      );
      assert.equal(canTransfer, "0x5c");
    });

    it("SUCCESS : Set rules, rule modifiable to false", async () => {
      rules = {
        ...rules,
        rulesModifiable: false,
      };
      await this.SecurityTokenImmutableContract.setRules(rules, {
        from: walletNewOwner,
      });
    });

    it("ERROR : Set rules, rule modifiable to true but rules is now not modifiable", async () => {
      rules = {
        ...rules,
        rulesModifiable: true,
      };
      await truffleAssert.reverts(
        this.SecurityTokenImmutableContract.setRules(rules, {
          from: walletNewOwner,
        }),
      );
    });
  });
  //TODO withdraw in period
  //TODO inject capital
  //TODO set fundraising
});
