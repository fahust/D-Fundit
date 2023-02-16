const truffleAssert = require("truffle-assertions");
// const onchainid = require('@onchain-id/solidity');
const decodeError = require("../utils/decodeError");

const { increaseTimeTo } = require("../utils/increaseTime");
// const { IdentitySDK } = require('@onchain-id/identity-sdk');

const SecurityToken = artifacts.require("SecurityToken");

const name = "name";
const code = "code";
const assetType = "asset type";
const amount = 10;
const ADDRESS_ZERO = "0x0000000000000000000000000000000000000000";

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
    this.SecurityTokenContract = await SecurityToken.new(name, code, {
      freezableAddress: true,
      freezablePartial: true,
      freezablePartialTime: true,
      pausable: true,
      forcableTransfer: true,
    }); // we deploy contract

    // await this.SecurityTokenContract.addAgentOnTokenContract(agent, {
    //   from: walletDeployer,
    // });

    // agentIdentityAddress = await deployIdentityProxy(agent);
  });

  describe("ERC-20 MODULE", async () => {
    // it("SUCCESS : Should get name of security token", async () => {
    //   const callName = await this.SecurityTokenContract.name();
    //   assert.equal(callName, name);
    // });

    // it("SUCCESS : Should get code of security token", async () => {
    //   const callCode = await this.SecurityTokenContract.code();
    //   assert.equal(callCode, code);
    // });

    // it("SUCCESS : Should get assetType of security token", async () => {
    //   const callAssetType = await this.SecurityTokenContract.assetType();
    //   assert.equal(callAssetType, assetType);
    // });

    it("SUCCESS : Should get totalSupply of security token", async () => {
      const callTotalSupply = await this.SecurityTokenContract.totalSupply();
      assert.equal(`${+callTotalSupply}`, 0);
    });

    it("SUCCESS : Should get balance from first founder before mint", async () => {
      const balanceBeforeMint = await this.SecurityTokenContract.balanceOf(
        walletFirstFounder,
      );
      assert.equal(`${+balanceBeforeMint}`, 0);
    });

    it("SUCCESS : Should get transfers from first founder before mint", async () => {
      const transfers = await this.SecurityTokenContract.transfers();
      assert.equal(transfers.length, 0);
    });

    it("ERROR : Should not mint with walletFirstFounder", async () => {
      try {
        await this.SecurityTokenContract.mint(walletDeployer, amount, {
          from: walletFirstFounder,
        });
      } catch (error) {
        const decodedError = await decodeError(error);
        assert.equal(decodedError.errorFunction, "NotWriter(address)");
        assert.equal(decodedError.decoded.sender, walletFirstFounder);
      }
    });

    it("SUCCESS : Should mint with deployer account", async () => {
      date = Math.floor(Date.now() / 10000);
      await this.SecurityTokenContract.mint(walletFirstFounder, amount);
    });

    it("SUCCESS : Should get balance from first founder after mint", async () => {
      const balanceAfterMint = await this.SecurityTokenContract.balanceOf(
        walletFirstFounder,
      );
      assert.equal(`${+balanceAfterMint}`, amount);
    });

    it("SUCCESS : Should get transfers after mint of first founder", async () => {
      const transfers = await this.SecurityTokenContract.transfers();
      assert.equal(transfers.length, 1);
      assert.equal(transfers[0].transferType, "mint");
      assert.equal(transfers[0].from, ADDRESS_ZERO);
      assert.equal(transfers[0].to, walletFirstFounder);
      assert.equal(transfers[0].amount, amount);
      assert.equal(Math.floor(transfers[0].date / 10), date);
    });

    it("ERROR : Should not burn with first founder account", async () => {
      try {
        await this.SecurityTokenContract.burn(walletFirstFounder, amount, {
          from: walletFirstFounder,
        });
      } catch (error) {
        const decodedError = await decodeError(error);
        assert.equal(decodedError.errorFunction, "NotWriter(address)");
        assert.equal(decodedError.decoded.sender, walletFirstFounder);
      }
    });

    it("SUCCESS : Should burn with deployer account", async () => {
      await this.SecurityTokenContract.burn(walletFirstFounder, amount);
      date = Math.floor(Date.now() / 10000);
    });

    it("SUCCESS : Should get transfers after burn of first founder", async () => {
      const transfers = await this.SecurityTokenContract.transfers();
      assert.equal(transfers.length, 2);

      assert.equal(transfers[0].transferType, "mint");
      assert.equal(transfers[0].from, ADDRESS_ZERO);
      assert.equal(transfers[0].to, walletFirstFounder);
      assert.equal(transfers[0].amount, amount);

      assert.equal(transfers[1].transferType, "burn");
      assert.equal(transfers[1].from, walletFirstFounder);
      assert.equal(transfers[1].to, ADDRESS_ZERO);
      assert.equal(transfers[1].amount, amount);
      // assert.equal(Math.floor(transfers[1].date / 10), date);
    });

    it("SUCCESS : Should transfer owner ship", async () => {
      const ownerBeforeTransferOwnership = await this.SecurityTokenContract.owner();
      assert.equal(ownerBeforeTransferOwnership, walletDeployer);

      await this.SecurityTokenContract.transferOwnership(walletNewOwner);

      await this.SecurityTokenContract.increaseAllowance(walletNewOwner, "20000000000");

      await this.SecurityTokenContract.increaseAllowance(walletDeployer, "20000000000");

      const ownerAfterTransferOwnership = await this.SecurityTokenContract.owner();
      assert.equal(ownerAfterTransferOwnership, walletNewOwner);
    });

    it("ERROR : Should not mint with walletDeployer", async () => {
      try {
        await this.SecurityTokenContract.mint(walletDeployer, amount, {
          from: walletDeployer,
        });
      } catch (error) {
        const decodedError = await decodeError(error);
        assert.equal(decodedError.errorFunction, "NotWriter(address)");
        assert.equal(decodedError.decoded.sender, walletDeployer);
      }
    });

    it("ERROR : Should not transfer with walletDeployer no balance", async () => {
      const canTransfer = await this.SecurityTokenContract.canTransfer(
        walletNewOwner,
        walletNewOwner,
        walletFirstFounder,
        amount,
      );
      assert.equal(canTransfer, "0x52");
      await truffleAssert.reverts(
        this.SecurityTokenContract.transfer(walletFirstFounder, amount, {
          from: walletNewOwner,
        }),
      );
    });

    it("SUCCESS : Should mint with new owner account to new owner", async () => {
      await this.SecurityTokenContract.mint(walletNewOwner, amount, {
        from: walletNewOwner,
      });
      const balance = await this.SecurityTokenContract.balanceOf(walletNewOwner);
      assert.equal(`${+balance}`, amount);
    });

    it("SUCCESS : Should transfer with walletDeployer", async () => {
      const canTransfer = await this.SecurityTokenContract.canTransfer(
        walletNewOwner,
        walletNewOwner,
        walletDeployer,
        amount,
      );
      assert.equal(canTransfer, "0x51");

      await this.SecurityTokenContract.transfer(walletDeployer, amount, {
        from: walletNewOwner,
      });
      const balance = await this.SecurityTokenContract.balanceOf(walletDeployer);
      assert.equal(`${+balance}`, amount);
    });

    it("SUCCESS : Should pause with walletNewOwner", async () => {
      await this.SecurityTokenContract.pause(Math.floor(Date.now() / 1000) + 10, {
        from: walletNewOwner,
      });
    });

    it("ERROR : Should not transfer with new owner account because contract is paused", async () => {
      const canTransfer = await this.SecurityTokenContract.canTransfer(
        walletNewOwner,
        walletDeployer,
        walletFirstFounder,
        amount,
      );
      assert.equal(canTransfer, "0x54");

      await truffleAssert.reverts(
        this.SecurityTokenContract.transferFrom(
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
        this.SecurityTokenContract.mint(walletFirstFounder, amount, {
          from: walletNewOwner,
        }),
      );
    });

    it("ERROR : Should not burn with walletNewOwner account because contract is paused", async () => {
      await truffleAssert.reverts(
        this.SecurityTokenContract.burn(walletFirstFounder, amount, {
          from: walletNewOwner,
        }),
      );
    });

    it("SUCCESS : Should unpause with walletNewOwner", async () => {
      await this.SecurityTokenContract.unpause({
        from: walletNewOwner,
      });
    });

    it("SUCCESS : Should transfer with new owner account", async () => {
      const canTransfer = await this.SecurityTokenContract.canTransfer(
        walletNewOwner,
        walletDeployer,
        walletFirstFounder,
        amount,
      );
      assert.equal(canTransfer, "0x51");

      await this.SecurityTokenContract.transferFrom(
        walletDeployer,
        walletFirstFounder,
        amount,
        {
          from: walletNewOwner,
        },
      );
      const balance = await this.SecurityTokenContract.balanceOf(walletFirstFounder);
      assert.equal(`${+balance}`, amount);
    });

    it("SUCCESS : Should get transfers after burn of first founder", async () => {
      const transfers = await this.SecurityTokenContract.transfers({
        from: walletNewOwner,
      });
      assert.equal(transfers.length, 5);

      assert.equal(transfers[0].transferType, "mint");
      assert.equal(transfers[0].from, ADDRESS_ZERO);
      assert.equal(transfers[0].to, walletFirstFounder);
      assert.equal(transfers[0].amount, amount);

      assert.equal(transfers[1].transferType, "burn");
      assert.equal(transfers[1].from, walletFirstFounder);
      assert.equal(transfers[1].to, ADDRESS_ZERO);
      assert.equal(transfers[1].amount, amount);

      assert.equal(transfers[2].transferType, "mint");
      assert.equal(transfers[2].from, ADDRESS_ZERO);
      assert.equal(transfers[2].to, walletNewOwner);
      assert.equal(transfers[2].amount, amount);

      assert.equal(transfers[3].transferType, "transfer");
      assert.equal(transfers[3].from, walletNewOwner);
      assert.equal(transfers[3].to, walletDeployer);
      assert.equal(transfers[3].amount, amount);

      assert.equal(transfers[4].transferType, "transfer");
      assert.equal(transfers[4].from, walletDeployer);
      assert.equal(transfers[4].to, walletFirstFounder);
      assert.equal(transfers[4].amount, amount);
    });
  });

  describe("FREEZING-ADDRESS MODULE", async () => {
    it("ERROR : Should not freeze address with not owner or agent address", async () => {
      await truffleAssert.reverts(
        this.SecurityTokenContract.setAddressFrozen(walletFirstFounder, false, {
          from: walletDeployer,
        }),
      );
    });

    it("SUCCESS : Should freeze address", async () => {
      await this.SecurityTokenContract.setAddressFrozen(walletFirstFounder, true, {
        from: walletNewOwner,
      });
    });

    it("SUCCESS : Should know if address it frozen", async () => {
      const isFrozen = await this.SecurityTokenContract.isFrozen(walletFirstFounder, {
        from: walletNewOwner,
      });
      assert.equal(isFrozen, true);
    });

    it("ERROR : Should not transfer with walletFirstFounder because freezed address", async () => {
      const canTransfer = await this.SecurityTokenContract.canTransfer(
        walletFirstFounder,
        walletFirstFounder,
        walletDeployer,
        amount,
      );
      assert.equal(canTransfer, "0x5a");

      await truffleAssert.reverts(
        this.SecurityTokenContract.transfer(walletDeployer, amount, {
          from: walletFirstFounder,
        }),
        //'wallet is frozen',
      );
      const balance = await this.SecurityTokenContract.balanceOf(walletFirstFounder);
      assert.equal(`${+balance}`, amount);
    });

    it("ERROR : Should not transferFrom with new owner account to freezed account", async () => {
      const canTransfer = await this.SecurityTokenContract.canTransfer(
        walletNewOwner,
        walletNewOwner,
        walletFirstFounder,
        amount,
      );
      assert.equal(canTransfer, "0x52");

      await truffleAssert.reverts(
        this.SecurityTokenContract.transferFrom(
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
        this.SecurityTokenContract.transferFrom(
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
      await this.SecurityTokenContract.batchSetAddressFrozen(
        [walletFirstFounder],
        [false],
        {
          from: walletNewOwner,
        },
      );
    });

    it("SUCCESS : Should transfer with walletFirstFounder", async () => {
      const canTransfer = await this.SecurityTokenContract.canTransfer(
        walletFirstFounder,
        walletFirstFounder,
        walletDeployer,
        amount,
      );
      assert.equal(canTransfer, "0x51");

      await this.SecurityTokenContract.transfer(walletDeployer, amount, {
        from: walletFirstFounder,
      });
      const balance = await this.SecurityTokenContract.balanceOf(walletDeployer);
      assert.equal(`${+balance}`, amount);
    });

    it("SUCCESS : Should transferFrom with new owner", async () => {
      await this.SecurityTokenContract.transferFrom(
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
        this.SecurityTokenContract.freezePartialTokens(walletFirstFounder, amount + 1, {
          from: walletNewOwner,
        }),
        //'Amount exceeds available balance',
      );
    });

    it("SUCCESS : Should freeze partial tokens walletFirstFounder", async () => {
      await this.SecurityTokenContract.freezePartialTokens(
        walletFirstFounder,
        amount / 2,
        {
          from: walletNewOwner,
        },
      );
    });

    it("SUCCESS : Should get freezed partial tokens on walletFirstFounder", async () => {
      const getFrozenTokens = await this.SecurityTokenContract.getFrozenTokens(
        walletFirstFounder,
        {
          from: walletNewOwner,
        },
      );
      assert.equal(`${+getFrozenTokens}`, amount / 2);
    });

    it("ERROR : Should not transfer with walletFirstFounder with partial freezed token", async () => {
      const canTransfer = await this.SecurityTokenContract.canTransfer(
        walletFirstFounder,
        walletFirstFounder,
        walletDeployer,
        amount,
      );
      assert.equal(canTransfer, "0x55");

      await truffleAssert.reverts(
        this.SecurityTokenContract.transfer(walletDeployer, amount, {
          from: walletFirstFounder,
        }),
        //'Insufficient Balance',
      );

      const balance = await this.SecurityTokenContract.balanceOf(walletFirstFounder);
      assert.equal(`${+balance}`, amount);
    });

    it("SUCCESS : Should transfer with walletFirstFounder", async () => {
      await this.SecurityTokenContract.transfer(walletDeployer, amount / 2, {
        from: walletFirstFounder,
      });

      const balanceWalletDeployer = await this.SecurityTokenContract.balanceOf(
        walletDeployer,
      );
      assert.equal(`${+balanceWalletDeployer}`, amount / 2);

      const balanceWalletFirstFounder = await this.SecurityTokenContract.balanceOf(
        walletFirstFounder,
      );
      assert.equal(`${+balanceWalletFirstFounder}`, amount / 2);

      await this.SecurityTokenContract.transfer(walletFirstFounder, amount / 2, {
        from: walletDeployer,
      });
    });

    it("SUCCESS : Should batch freeze partial tokens walletFirstFounder", async () => {
      const balanceOf = await this.SecurityTokenContract.balanceOf(walletFirstFounder);
      const getFrozenTokens = await this.SecurityTokenContract.getFrozenTokens(
        walletFirstFounder,
      );
      assert.equal(`${`${+balanceOf}` - +getFrozenTokens}`, amount / 2);

      await this.SecurityTokenContract.batchFreezePartialTokens(
        [walletFirstFounder],
        [`${`${+balanceOf}` - +getFrozenTokens}`],
        {
          from: walletNewOwner,
        },
      );
    });

    it("ERROR : Should not transferFrom with new owner with partial freezed token", async () => {
      const canTransfer = await this.SecurityTokenContract.canTransfer(
        walletNewOwner,
        walletFirstFounder,
        walletDeployer,
        1,
      );
      assert.equal(canTransfer, "0x55");

      await truffleAssert.reverts(
        this.SecurityTokenContract.transferFrom(walletFirstFounder, walletDeployer, 1, {
          from: walletNewOwner,
        }),
      );
    });

    it("SUCCESS : Should batch freeze partial tokens walletFirstFounder", async () => {
      await this.SecurityTokenContract.batchUnfreezePartialTokens(
        [walletFirstFounder],
        [amount / 2],
        {
          from: walletNewOwner,
        },
      );
    });

    it("SUCCESS : Should freeze partial tokens walletFirstFounder", async () => {
      await this.SecurityTokenContract.unfreezePartialTokens(
        walletFirstFounder,
        amount / 2,
        {
          from: walletNewOwner,
        },
      );

      const getFrozenTokens = await this.SecurityTokenContract.getFrozenTokens(
        walletFirstFounder,
      );

      assert.equal(`${+getFrozenTokens}`, 0);
    });

    // it('ERROR : Should force transfer', async () => {
    //   await truffleAssert.reverts(
    //     this.SecurityTokenContract.forcedTransfer(
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

  describe("IDENTITY MODULE", async () => {
    it("SUCCESS : add agent into identity registry and identity registrery storage", async () => {
      await this.IdentityRegistryStorage.addAgent(agent);

      const isAgentStored = await this.IdentityRegistryStorage.isAgent(agent);
      assert.equal(isAgentStored, true);

      await this.IdentityRegistry.addAgentOnIdentityRegistryContract(agent);

      const isAgent = await this.IdentityRegistry.isAgent(agent);
      assert.equal(isAgent, true);

      await this.SecurityTokenContract.addAgent(agent, { from: walletNewOwner });

      const isAgentToken = await this.SecurityTokenContract.isAgent(agent, {
        from: walletNewOwner,
      });
      assert.equal(isAgentToken, true);
    });

    it("SUCCESS : Should register identity", async () => {
      const agentIdentityBeforeRegister = await this.IdentityRegistry.identity(agent);
      assert.equal(agentIdentityBeforeRegister, ADDRESS_ZERO);
      await this.IdentityRegistryStorage.addIdentityToStorage(
        agent,
        this.IdentityRegistry.address,
        101,
        {
          from: agent,
        },
      );

      const agentIdentityAfterRegister = await this.IdentityRegistry.identity(agent);
      assert.equal(agentIdentityAfterRegister, this.IdentityRegistry.address);
    });

    it("ERROR : Should not register again same identity", async () => {
      await truffleAssert.reverts(
        this.IdentityRegistryStorage.addIdentityToStorage(
          agent,
          this.IdentityRegistry.address,
          101,
          {
            from: agent,
          },
        ),
        //'identity contract already exists, please use update.',
      );
    });

    it("SUCCESS : Should modify stored identity", async () => {
      await this.IdentityRegistryStorage.modifyStoredIdentity(
        agent,
        this.IdentityRegistry.address,
        {
          from: agent,
        },
      );

      const agentIdentityAfterRegister = await this.IdentityRegistry.identity(agent);
      assert.equal(agentIdentityAfterRegister, this.IdentityRegistry.address);
    });

    it("SUCCESS : Should modify stored identity", async () => {
      const countryBeforeUpdate =
        await this.IdentityRegistryStorage.storedInvestorCountry(agent, {
          from: agent,
        });
      assert.equal(countryBeforeUpdate, 101);

      await this.IdentityRegistryStorage.modifyStoredInvestorCountry(agent, 102, {
        from: agent,
      });

      const countryAfterUpdate = await this.IdentityRegistryStorage.storedInvestorCountry(
        agent,
        {
          from: agent,
        },
      );
      assert.equal(countryAfterUpdate, 102);
    });

    it("SUCCESS : Should remove stored identity", async () => {
      await this.IdentityRegistryStorage.removeIdentityFromStorage(agent, {
        from: agent,
      });

      const agentIdentityAfterRegister = await this.IdentityRegistry.identity(agent);
      assert.equal(agentIdentityAfterRegister, ADDRESS_ZERO);
    });

    it("ERROR : Should not remove not existing stored identity", async () => {
      await truffleAssert.reverts(
        this.IdentityRegistryStorage.removeIdentityFromStorage(agent, {
          from: agent,
        }),
      );

      const agentIdentityAfterRegister = await this.IdentityRegistry.identity(agent);
      assert.equal(agentIdentityAfterRegister, ADDRESS_ZERO);
    });

    it("SUCCESS : Should register identity", async () => {
      const agentIdentityBeforeRegister = await this.IdentityRegistry.identity(agent);
      assert.equal(agentIdentityBeforeRegister, ADDRESS_ZERO);
      await this.IdentityRegistryStorage.addIdentityToStorage(
        agent,
        this.IdentityRegistry.address,
        101,
        {
          from: agent,
        },
      );

      const agentIdentityAfterRegister = await this.IdentityRegistry.identity(agent);
      assert.equal(agentIdentityAfterRegister, this.IdentityRegistry.address);
    });

    it("SUCCESS : Should force transfer", async () => {
      const canTransfer = await this.SecurityTokenContract.canTransfer(
        agent,
        walletFirstFounder,
        walletDeployer,
        amount,
      );
      assert.equal(canTransfer, "0x51");

      await this.SecurityTokenContract.forceTransfer(
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
        this.SecurityTokenContract.setFreezedTokensPeriod(
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

      await this.SecurityTokenContract.setFreezedTokensPeriod(
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
        await this.SecurityTokenContract.myFreezedTokensPeriod({
          from: walletDeployer,
        });

      assert.equal(
        Math.floor(myFreezedTokensPeriod.startTime / 10),
        Math.floor(+now / 10000),
      );
      assert.equal(
        Math.floor(myFreezedTokensPeriod.endTime / 10),
        Math.floor(+someDaysLater / 10000),
      );
      assert.equal(myFreezedTokensPeriod.amountFreezed, amountRandom);
    });

    it(`SUCCESS : Should increase block timestamp to ${dayWaitedRandom} day`, async () => {
      const now = new Date();
      const someDaysLater = new Date();
      someDaysLater.setDate(now.getDate() + dayWaitedRandom);

      const blockTimeStampBeforeIncreaseTime = await this.SecurityTokenContract._now();
      assert.equal(
        Math.floor(+blockTimeStampBeforeIncreaseTime / 10),
        Math.floor(+now / 10000),
      );

      await increaseTimeTo(Math.floor(+someDaysLater / 1000));

      const blockTimeStampAfterIncreaseTime = await this.SecurityTokenContract._now();
      assert.equal(
        Math.floor(+blockTimeStampAfterIncreaseTime / 10),
        Math.floor(+someDaysLater / 10000),
      );
    });

    it("SUCCESS : Should get unlockable tokens period off chain and compare with on chain result", async () => {
      const myFreezedTokensPeriod =
        await this.SecurityTokenContract.myFreezedTokensPeriod({
          from: walletDeployer,
        });
      const now = await this.SecurityTokenContract._now();
      const diff = myFreezedTokensPeriod.endTime - myFreezedTokensPeriod.startTime;
      const timeBehind = now - myFreezedTokensPeriod.startTime;
      percentExpected = (timeBehind * 100) / diff;

      const unlockableTokensPeriod =
        await this.SecurityTokenContract.unlockableTokensPeriod({
          from: walletDeployer,
        });
      assert.equal(
        Math.floor(amountRandom * (Math.floor(percentExpected) / 100)),
        +unlockableTokensPeriod,
      );
    });

    it("ERROR : Should compare result of eligibleBalanceOf", async () => {
      const eligibleBalanceOf = await this.SecurityTokenContract.eligibleBalanceOf(
        walletDeployer,
      );
      const myFreezedTokensPeriod =
        await this.SecurityTokenContract.myFreezedTokensPeriod({
          from: walletDeployer,
        });
      const balanceOf = await this.SecurityTokenContract.balanceOf(walletDeployer);
      assert.equal(+balanceOf - myFreezedTokensPeriod.amountFreezed, +eligibleBalanceOf);
    });

    it("ERROR : Should not transfer with walletFirstFounder with partial freezed token because upper to unlocked balance", async () => {
      const canTransfer = await this.SecurityTokenContract.canTransfer(
        walletDeployer,
        walletDeployer,
        walletFirstFounder,
        amount,
      );
      assert.equal(canTransfer, "0x55");

      await truffleAssert.reverts(
        this.SecurityTokenContract.transfer(walletFirstFounder, amount, {
          from: walletDeployer,
        }),
        //'Insufficient Balance',
      );

      const balance = await this.SecurityTokenContract.balanceOf(walletDeployer);
      assert.equal(+balance, amount);
    });

    it("ERROR : Should not transferFrom with walletDeployer account 1 more of eligibleBalanceOf", async () => {
      const eligibleBalanceOf = await this.SecurityTokenContract.eligibleBalanceOf(
        walletDeployer,
      );
      assert.equal(+eligibleBalanceOf, amount - amountRandom);

      const canTransfer = await this.SecurityTokenContract.canTransfer(
        walletDeployer,
        walletDeployer,
        walletFirstFounder,
        amount - amountRandom + 1,
      );
      assert.equal(canTransfer, "0x55");

      await truffleAssert.reverts(
        this.SecurityTokenContract.transferFrom(
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
      await this.SecurityTokenContract.redeemFreezedTokens({
        from: walletDeployer,
      });
    });

    it("SUCCESS : Should get my freezed tokens period after redeem", async () => {
      const myFreezedTokensPeriod =
        await this.SecurityTokenContract.myFreezedTokensPeriod({
          from: walletDeployer,
        });

      assert.equal(
        Math.floor(amountRandom * (Math.floor(percentExpected) / 100)),
        amountRandom - +myFreezedTokensPeriod.amountFreezed,
      );
    });

    it("SUCCESS : Should transfer with walletFirstFounder with partial redeemed freezed tokens", async () => {
      const myFreezedTokensPeriod =
        await this.SecurityTokenContract.myFreezedTokensPeriod({
          from: walletDeployer,
        });
      firstTransfer = amountRandom - +myFreezedTokensPeriod.amountFreezed;
      await this.SecurityTokenContract.transfer(walletFirstFounder, firstTransfer, {
        from: walletDeployer,
      });

      const balance = await this.SecurityTokenContract.balanceOf(walletDeployer);
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
      await this.SecurityTokenContract.redeemFreezedTokens({
        from: walletDeployer,
      });
    });

    it("SUCCESS : Should get my freezed tokens period and expected not remaining token freezed", async () => {
      const myFreezedTokensPeriod =
        await this.SecurityTokenContract.myFreezedTokensPeriod({
          from: walletDeployer,
        });

      assert.equal(+myFreezedTokensPeriod.amountFreezed, 0);
    });

    it("ERROR : Should not redeem freezed tokens period but no token to unfreeze", async () => {
      await truffleAssert.reverts(
        this.SecurityTokenContract.redeemFreezedTokens({
          from: walletDeployer,
        }),
        //'No token to unfreeze',
      );
    });

    it("SUCCESS : Should transfer remaining tokens with walletFirstFounder after unfreezed totality token", async () => {
      const balanceBeforeLastTransfer = await this.SecurityTokenContract.balanceOf(
        walletFirstFounder,
      );

      await this.SecurityTokenContract.transfer(
        walletFirstFounder,
        amount - balanceBeforeLastTransfer,
        {
          from: walletDeployer,
        },
      );

      const balanceAfterLastTransfer = await this.SecurityTokenContract.balanceOf(
        walletFirstFounder,
      );
      assert.equal(`${+balanceAfterLastTransfer}`, amount);
    });
  });
});
