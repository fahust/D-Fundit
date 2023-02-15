/* eslint-disable no-undef */
// const truffleAssert = require('truffle-assertions');
// const onchainid = require('@onchain-id/solidity');
const decodeError = require('../utils/decodeError');

const { increaseTimeTo } = require('../utils/increaseTime');
// const { IdentitySDK } = require('@onchain-id/identity-sdk');

const SecurityToken = artifacts.require('SecurityToken');
const IdentityRegistry = artifacts.require('IdentityRegistry');
const ClaimTopicsRegistry = artifacts.require('ClaimTopicsRegistry');
const TrustedIssuersRegistry = artifacts.require('TrustedIssuersRegistry');
const IdentityRegistryStorage = artifacts.require('IdentityRegistryStorage');

const name = 'name';
const code = 'code';
const assetType = 'asset type';

function randomIntFromInterval(min, max) {
  // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
}

let date;

contract('SECURITY TOKEN WITH RECOVERY', async accounts => {
  const walletDeployer = accounts[0];
  const walletNewOwner = accounts[2];
  const allTransfers = [];

  const allBalances = {
    [accounts[0]]: 0,
    [accounts[1]]: 0,
    [accounts[2]]: 0,
    [accounts[3]]: 0,
    [accounts[4]]: 0,
    [accounts[5]]: 0,
    [accounts[6]]: 0,
    [accounts[7]]: 0,
    [accounts[8]]: 0,
    [accounts[9]]: 0,
  };

  it('SUCCESS : Should deploy smart contract security token', async () => {
    this.ClaimTopicsRegistry = await ClaimTopicsRegistry.new(); // we deploy contract

    const ClaimTopicsRegistryAddress = this.ClaimTopicsRegistry.address;

    this.TrustedIssuersRegistry = await TrustedIssuersRegistry.new(); // we deploy contract
    const TrustedIssuersRegistryAddress = this.TrustedIssuersRegistry.address;

    this.IdentityRegistryStorage = await IdentityRegistryStorage.new(); // we deploy contract
    const IdentityRegistryStorageAddress = this.IdentityRegistryStorage.address;

    this.IdentityRegistry = await IdentityRegistry.new(
      ClaimTopicsRegistryAddress,
      TrustedIssuersRegistryAddress,
      IdentityRegistryStorageAddress,
    ); // we deploy contract
    const IdentityRegistryAddress = this.IdentityRegistry.address;

    this.SecurityTokenContract = await SecurityToken.new(
      {
        name,
        code,
        assetType,
        recovery: false,
      },
      IdentityRegistryAddress,
      IdentityRegistryAddress, // change that into onchainid address
    ); // we deploy contract

    // await this.SecurityTokenContract.addAgentOnTokenContract(agent, {
    //   from: walletDeployer,
    // });

    // agentIdentityAddress = await deployIdentityProxy(agent);
  });

  describe('RECOVERY-OLD-REGISTER MODULE', async () => {
    it('SUCCESS : Should stop recovery because increase one day block', async () => {
      const now = new Date();
      const oneDayLater = new Date();
      oneDayLater.setDate(now.getDate() + 1);

      const blockTimeStampBeforeIncreaseTime = await this.SecurityTokenContract._now();
      assert.equal(
        Math.floor(+blockTimeStampBeforeIncreaseTime / 10),
        Math.floor(+now / 10000),
      );

      await increaseTimeTo(Math.floor(+oneDayLater / 1000));

      const blockTimeStampAfterIncreaseTime = await this.SecurityTokenContract._now();
      assert.equal(
        Math.floor(+blockTimeStampAfterIncreaseTime / 10),
        Math.floor(+oneDayLater / 10000),
      );
    });

    it('ERROR : Should not recovery old transfers with parameter recovery is in past', async () => {
      try {
        const oldTransfers = [];
        for (let index = 0; index < 30; index++) {
          oldTransfers.push({
            transferType: 'transfer',
            from: walletDeployer,
            to: walletNewOwner,
            amount: 10,
            date: Math.floor(Date.now() / 1000),
          });
        }

        await this.SecurityTokenContract.recoveryOldTransfers(oldTransfers, {
          from: walletNewOwner,
        });
      } catch (error) {
        const decodedError = await decodeError(error);
        assert.equal(decodedError.errorFunction, 'NotInRecovery(address)');
        assert.equal(decodedError.decoded.sender, walletNewOwner);
      }
    });

    it('ERROR : Should not recovery old balances with parameter recovery is in past', async () => {
      try {
        const addresses = [];
        const balances = [];
        for (let index = 0; index < 10; index++) {
          addresses.push(accounts[randomIntFromInterval(0, 9)]);
          balances.push(randomIntFromInterval(1, 10));
        }

        await this.SecurityTokenContract.recoveryOldBalances(addresses, balances, {
          from: walletNewOwner,
        });
      } catch (error) {
        const decodedError = await decodeError(error);
        assert.equal(decodedError.errorFunction, 'NotInRecovery(address)');
        assert.equal(decodedError.decoded.sender, walletNewOwner);
      }
    });

    it('SUCCESS : Should deploy smart contract basic token with recovery in future', async () => {
      this.SecurityTokenContract = await SecurityToken.new(
        {
          name,
          code,
          assetType,
          recovery: true,
        },

        this.IdentityRegistry.address,
        this.IdentityRegistry.address, // change that into onchainid address
      ); // we deploy contract
    });

    it('SUCCESS : Should recovery old transfers with parameter recovery in future', async () => {
      date = Math.floor(Date.now() / 1000);
      for (let i = 0; i < 10; i++) {
        const oldTransfers = [];
        for (let j = 0; j < 30; j++) {
          oldTransfers.push({
            transferType: 'transfer',
            from: accounts[randomIntFromInterval(0, 9)],
            to: accounts[randomIntFromInterval(0, 9)],
            amount: randomIntFromInterval(0, 500),
            date: randomIntFromInterval(0, date),
          });
          allTransfers.push(oldTransfers[j]);
        }

        await this.SecurityTokenContract.recoveryOldTransfers(oldTransfers);
      }
    });

    it('SUCCESS : Should get transfers after recovery', async () => {
      const transfers = await this.SecurityTokenContract.transfers();

      assert.equal(transfers.length, allTransfers.length);
      for (let index = 0; index < transfers.length; index++) {
        assert.equal(transfers[index].amount, allTransfers[index].amount);
        assert.equal(transfers[index].from, allTransfers[index].from);
        assert.equal(transfers[index].to, allTransfers[index].to);
        assert.equal(transfers[index].transferType, 'transfer');
      }
    });

    it('SUCCESS : Should recovery old balances with parameter recovery in future', async () => {
      for (let i = 0; i < 10; i++) {
        const addresses = [];
        const balances = [];
        for (let j = 0; j < 10; j++) {
          const increaseBalance = randomIntFromInterval(1, 10);
          addresses.push(accounts[j]);
          balances.push(increaseBalance);
          allBalances[accounts[j]] += increaseBalance;
        }

        await this.SecurityTokenContract.recoveryOldBalances(addresses, balances);
      }
    });

    it('SUCCESS : Should get balance after old recovery', async () => {
      for (let index = 0; index < 10; index++) {
        const balance = await this.SecurityTokenContract.balanceOf(accounts[index]);
        assert.ok(`${+balance}` > 10, 'Not enough balance');
        assert.equal(+balance, allBalances[accounts[index]]);
      }
    });

    it('SUCCESS : Should stop recovery', async () => {
      await this.SecurityTokenContract.stopRecovery();
    });

    it('ERROR : Should not recovery old transfers with parameter recovery is in past', async () => {
      try {
        const oldTransfers = [];
        for (let index = 0; index < 30; index++) {
          oldTransfers.push({
            transferType: 'transfer',
            from: walletDeployer,
            to: walletNewOwner,
            amount: 10,
            date: Math.floor(Date.now() / 1000),
          });
        }

        await this.SecurityTokenContract.recoveryOldTransfers(oldTransfers, {
          from: walletNewOwner,
        });
      } catch (error) {
        const decodedError = await decodeError(error);
        assert.equal(decodedError.errorFunction, 'NotInRecovery(address)');
        assert.equal(decodedError.decoded.sender, walletNewOwner);
      }
    });

    it('ERROR : Should not recovery old balances with parameter recovery is in past', async () => {
      try {
        const addresses = [];
        const balances = [];
        for (let index = 0; index < 10; index++) {
          addresses.push(accounts[randomIntFromInterval(0, 9)]);
          balances.push(randomIntFromInterval(1, 10));
        }

        await this.SecurityTokenContract.recoveryOldBalances(addresses, balances);
      } catch (error) {
        const decodedError = await decodeError(error);
        assert.equal(decodedError.errorFunction, 'NotInRecovery(address)');
        assert.equal(decodedError.decoded.sender, walletDeployer);
      }
    });
  });
});
