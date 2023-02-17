import logo from "./logo.svg";
import { createContract } from "./helper/Deploy";
import SecurityTokenImmutable from "./abi/SecurityTokenImmutable.json";
import "./App.css";
import { ethers, AlchemyProvider, formatUnits, getDefaultProvider } from "ethers";

async function deploySecurityToken() {
  const params = [
    "name",
    "code",
    {
      freezableAddress: true,
      freezablePartial: true,
      freezablePartialTime: true,
      pausable: true,
      forcableTransfer: true,
      dayToWithdraw: 0,
      rulesModifiable: true,
      startFundraising: Math.floor(Date.now() / 1000),
      endFundraising: Math.floor(Date.now() / 1000) + 1000000000,
      maxSupply: 10000,
    },
  ];
  const deployment = await createContract(
    params,
    SecurityTokenImmutable.abi,
    SecurityTokenImmutable.bytecode,
  );
  console.log(deployment);
}

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
        <button onClick={() => deploySecurityToken()}>DEPLOY CONTRACT</button>
      </header>
    </div>
  );
}

export default App;
