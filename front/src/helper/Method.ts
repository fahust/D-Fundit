import Utils from "./Utils";
import { call, estimate } from "./estimateOrCall";

const utils = new Utils();

export async function method(
  functionName: string,
  address: string,
  params: any,
  onlyEstimate: boolean = false,
) {
  try {
    await utils.connect();
    const DropContract = await utils.contractInstance("SecurityTokenImmutable", address);

    // params = [quantity, baseFakeURI];
    const gasLimit = await estimate(DropContract, functionName, params, "");
    if (onlyEstimate === true) return gasLimit;
    const tx = await call(DropContract, functionName, params, "", gasLimit);
    await utils.waitTx(tx);

    return tx;
  } catch (error) {
    throw error; //await this.errorsBlockchain({ error });
  }
}
