export const estimate = async (
  dpInstance: any,
  functionName: string,
  args: Array<string | number | boolean | object | Uint8Array>,
  value: string,
) => {
  let arg: Array<string | number | boolean | object | Uint8Array> = [];
  if (value !== "" && value && args && args.length > 0) {
    args?.push({ value });
    arg = args;
  } else if (value !== "" && value) {
    arg = [{ value: value }];
  } else if (args && args.length > 0) {
    arg = args;
  }
  const estimatedGas = await dpInstance.estimateGas[functionName](...arg);

  return estimatedGas;
};

export const call = async (
  dpInstance: any,
  functionName: string,
  args: Array<string | number | boolean | object | Uint8Array>,
  value: string,
  estimatedGas: string,
) => {
  let arg: Array<string | number | boolean | object | Uint8Array> = [];
  if (value !== "" && value && args && args.length > 0) {
    if (estimatedGas !== "0") {
      args?.push({ value: value, gasLimit: estimatedGas });
    } else {
      args?.push({ value: value });
    }
    arg = args;
  } else if (value !== "" && value) {
    if (estimatedGas !== "0") {
      arg = [{ value: value, gasLimit: estimatedGas }];
    } else {
      arg = [{ value: value }];
    }
  } else if (args && args.length > 0) {
    if (estimatedGas !== "0") {
      args?.push({ gasLimit: estimatedGas });
    }
    arg = args;
  }
  const returnedValue = await dpInstance[functionName](...arg);
  return returnedValue;
};
