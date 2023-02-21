module.exports = [
  'NotTheOwner(address)',
  'NotWriter(address)',
  'NotReader(address)',
  'NotInRecovery(address)',
  'TransferFromZeroAddress(address)',
  'TransferToZeroAddress(address)',
  'TransferAmountExceedsBalance(uint256,address,uint256)',
  'MintFromZeroAddress(address)',
  'MintDoesNotWork(address,uint256,uint256,uint256)',
  'BurnFromZeroAddress(address)',
  'BurnAmountExceedsBalance(address,uint256,uint256)',
];
