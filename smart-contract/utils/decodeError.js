const ethers = require('ethers');
const ABIErrorsFunction = require('./ABIErrorsFunction');
const ABIErrorsType = require('./ABIErrorsType');

/**
 * Util to decode solidity custom error
 */
module.exports = async function decodeError(error) {
  const interfaceEthers = new ethers.utils.Interface(ABIErrorsFunction);

  const { decoded, errorFunction } = searchMathError(
    ABIErrorsFunction,
    interfaceEthers,
    error,
  );

  return {
    errorFunction: errorFunction || error,
    decoded,
  };
};

function searchMathError(ABIErrorsFunction, interfaceEthers, error) {
  for (const key in ABIErrorsFunction) {
    try {
      const decoded = interfaceEthers.decodeFunctionData(
        interfaceEthers.functions[ABIErrorsType[key]],
        error.data.result,
      );
      return { decoded, errorFunction: ABIErrorsType[key] };
      // eslint-disable-next-line no-empty
    } catch (_) {}
  }
}
