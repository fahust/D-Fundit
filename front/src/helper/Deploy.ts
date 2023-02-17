import { ethers, BytesLike, ContractFactory } from "ethers";
import Utils from "./Utils";

const utils = new Utils();

export async function createContract(
  params: any,
  contractInterface: ethers.InterfaceAbi,
  bytecode:
    | BytesLike
    | {
        object: string;
      },
) {
  try {
    await utils.connect();
    const signer = utils.signer;
    const factoryContract = new ContractFactory(contractInterface, bytecode, signer);
    const contract = await deployContract(factoryContract, params);
    return contract;
  } catch (error) {
    if (error instanceof Error) {
      return error;
    } else {
      return new Error("Error deploying contract :" + error);
    }
  }
}

export async function deployContract(
  factoryContract: ethers.ContractFactory,
  params: Array<any>,
) {
  return factoryContract.deploy(...params);
}
