/* eslint-disable no-undef */
const truffleAssert = require('truffle-assertions');
const decodeError = require('../utils/decodeError');

const BasicToken = artifacts.require('BasicToken');

const name = 'name';
const code = 'code';
const assetType = 'asset type';
const amount = 10;
const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000';

let date;

contract('BASIC TOKEN', async accounts => {
  const walletDeployer = accounts[0];
  const walletFirstFounder = accounts[1];
  const walletNewOwner = accounts[2];

  describe('Mint And Transfer', async () => {
    it('SUCCESS : Should deploy smart contract basic token', async () => {
      this.BasicTokenContract = await BasicToken.new({
        name,
        code,
        assetType,
      }); // we deploy contract
    });

    it('SUCCESS : Should get name of basic token', async () => {
      const callName = await this.BasicTokenContract.name();
      assert.equal(callName, name);
    });

    it('SUCCESS : Should get code of basic token', async () => {
      const callCode = await this.BasicTokenContract.code();
      assert.equal(callCode, code);
    });

    it('SUCCESS : Should get assetType of basic token', async () => {
      const callAssetType = await this.BasicTokenContract.assetType();
      assert.equal(callAssetType, assetType);
    });

    it('SUCCESS : Should get totalSupply of basic token', async () => {
      const callTotalSupply = await this.BasicTokenContract.totalSupply();
      assert.equal(`${+callTotalSupply}`, 0);
    });

    it('SUCCESS : Should get balance from first founder before mint', async () => {
      const balanceBeforeMint = await this.BasicTokenContract.balanceOf(
        walletFirstFounder,
      );
      assert.equal(`${+balanceBeforeMint}`, 0);
    });

    it('SUCCESS : Should get transfers from first founder before mint', async () => {
      const transfers = await this.BasicTokenContract.transfers();
      assert.equal(transfers.length, 0);
    });

    it('ERROR : Should not mint with walletFirstFounder', async () => {
      try {
        await this.BasicTokenContract.mint(walletDeployer, amount, {
          from: walletFirstFounder,
        });
      } catch (error) {
        const decodedError = await decodeError(error);
        assert.equal(decodedError.errorFunction, 'NotWriter(address)');
        assert.equal(decodedError.decoded.sender, walletFirstFounder);
      }
    });

    it('SUCCESS : Should mint with deployer account', async () => {
      date = Math.floor(Date.now() / 10000);
      await this.BasicTokenContract.mint(walletFirstFounder, amount);
    });

    it('SUCCESS : Should get balance from first founder after mint', async () => {
      const balanceAfterMint = await this.BasicTokenContract.balanceOf(
        walletFirstFounder,
      );
      assert.equal(`${+balanceAfterMint}`, amount);
    });

    it('SUCCESS : Should get transfers after mint of first founder', async () => {
      const transfers = await this.BasicTokenContract.transfers();
      assert.equal(transfers.length, 1);
      assert.equal(transfers[0].transferType, 'mint');
      assert.equal(transfers[0].from, ADDRESS_ZERO);
      assert.equal(transfers[0].to, walletFirstFounder);
      assert.equal(transfers[0].amount, amount);
      assert.equal(Math.floor(transfers[0].date / 10), date);
    });

    it('ERROR : Should not burn with first founder account', async () => {
      try {
        await this.BasicTokenContract.burn(walletFirstFounder, amount, {
          from: walletFirstFounder,
        });
      } catch (error) {
        const decodedError = await decodeError(error);
        assert.equal(decodedError.errorFunction, 'NotWriter(address)');
        assert.equal(decodedError.decoded.sender, walletFirstFounder);
      }
    });

    it('SUCCESS : Should burn with deployer account', async () => {
      await this.BasicTokenContract.burn(walletFirstFounder, amount);
      date = Math.floor(Date.now() / 10000);
    });

    it('SUCCESS : Should get transfers after burn of first founder', async () => {
      const transfers = await this.BasicTokenContract.transfers();
      assert.equal(transfers.length, 2);

      assert.equal(transfers[0].transferType, 'mint');
      assert.equal(transfers[0].from, ADDRESS_ZERO);
      assert.equal(transfers[0].to, walletFirstFounder);
      assert.equal(transfers[0].amount, amount);

      assert.equal(transfers[1].transferType, 'burn');
      assert.equal(transfers[1].from, walletFirstFounder);
      assert.equal(transfers[1].to, ADDRESS_ZERO);
      assert.equal(transfers[1].amount, amount);
      assert.equal(Math.floor(transfers[1].date / 10), date);
    });

    it('SUCCESS : Should transfer owner ship', async () => {
      const ownerBeforeTransferOwnership = await this.BasicTokenContract.owner();
      assert.equal(ownerBeforeTransferOwnership, walletDeployer);

      await this.BasicTokenContract.transferOwnership(walletNewOwner);

      await this.BasicTokenContract.increaseAllowance(walletNewOwner, '20000000000');

      const ownerAfterTransferOwnership = await this.BasicTokenContract.owner();
      assert.equal(ownerAfterTransferOwnership, walletNewOwner);
    });

    it('ERROR : Should not mint with walletDeployer', async () => {
      try {
        await this.BasicTokenContract.mint(walletDeployer, amount, {
          from: walletDeployer,
        });
      } catch (error) {
        const decodedError = await decodeError(error);
        assert.equal(decodedError.errorFunction, 'NotWriter(address)');
        assert.equal(decodedError.decoded.sender, walletDeployer);
      }
    });

    it('ERROR : Should not mint with walletDeployer no balance', async () => {
      await truffleAssert.reverts(
        this.BasicTokenContract.transfer(walletFirstFounder, amount, {
          from: walletNewOwner,
        }),
      );
    });

    it('SUCCESS : Should mint with new owner account to new owner', async () => {
      await this.BasicTokenContract.mint(walletNewOwner, amount, {
        from: walletNewOwner,
      });
      const balance = await this.BasicTokenContract.balanceOf(walletNewOwner);
      assert.equal(`${+balance}`, amount);
    });

    it('SUCCESS : Should mint with walletDeployer', async () => {
      await this.BasicTokenContract.transfer(walletDeployer, amount, {
        from: walletNewOwner,
      });
      const balance = await this.BasicTokenContract.balanceOf(walletDeployer);
      assert.equal(`${+balance}`, amount);
    });

    it('SUCCESS : Should transfer with new owner account', async () => {
      await this.BasicTokenContract.transferFrom(
        walletDeployer,
        walletFirstFounder,
        amount,
        {
          from: walletNewOwner,
        },
      );
      const balance = await this.BasicTokenContract.balanceOf(walletFirstFounder);
      assert.equal(`${+balance}`, amount);
    });

    it('SUCCESS : Should get transfers after burn of first founder', async () => {
      const transfers = await this.BasicTokenContract.transfers({ from: walletNewOwner });
      assert.equal(transfers.length, 5);

      assert.equal(transfers[0].transferType, 'mint');
      assert.equal(transfers[0].from, ADDRESS_ZERO);
      assert.equal(transfers[0].to, walletFirstFounder);
      assert.equal(transfers[0].amount, amount);

      assert.equal(transfers[1].transferType, 'burn');
      assert.equal(transfers[1].from, walletFirstFounder);
      assert.equal(transfers[1].to, ADDRESS_ZERO);
      assert.equal(transfers[1].amount, amount);

      assert.equal(transfers[2].transferType, 'mint');
      assert.equal(transfers[2].from, ADDRESS_ZERO);
      assert.equal(transfers[2].to, walletNewOwner);
      assert.equal(transfers[2].amount, amount);

      assert.equal(transfers[3].transferType, 'transfer');
      assert.equal(transfers[3].from, walletNewOwner);
      assert.equal(transfers[3].to, walletDeployer);
      assert.equal(transfers[3].amount, amount);

      assert.equal(transfers[4].transferType, 'transfer');
      assert.equal(transfers[4].from, walletDeployer);
      assert.equal(transfers[4].to, walletFirstFounder);
      assert.equal(transfers[4].amount, amount);
    });
  });
});
