module.exports = [
  'function NotTheOwner(address sender)',
  'function NotWriter(address sender)',
  'function NotReader(address sender)',
  'function NotInRecovery(address sender)',
  'function TransferFromZeroAddress(address from)',
  'function TransferToZeroAddress(address to)',
  'function TransferAmountExceedsBalance( uint256 fromBalance, address from, uint256 amount)',
  'function MintFromZeroAddress(address account)',
  'function MintDoesNotWork(address account, uint256 previousBalance, uint256 currentBalance, uint256 amount)',
  'function BurnFromZeroAddress(address account)',
  'function BurnAmountExceedsBalance(address account, uint256 accountBalance, uint256 amount)',
];
