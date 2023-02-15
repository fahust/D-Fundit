<a name="readme-top"></a>

# Smart Contracts

<!-- TABLE OF CONTENTS -->
<details open>
  <summary>ENGLISH - Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#available-commands">Available Commands</a></li>
        <li><a href="#test-contract">Test Contracts</a></li>
        <li><a href="#good-practices">Solidity Good Practices</a></li>
      </ul>
    </li>
    <li>
      <a href="#contracts">Security Token</a>
      <ul>
        <li><a href="#motivation">EIP 3643</a></li>
        <li><a href="#error">Errors</a></li>
        <li><a href="#event">Events</a></li>
        <li><a href="#roles">Roles</a></li>
        <li><a href="#freezing">Freezing</a></li>
        <li><a href="#balance">Balance</a></li>
        <li><a href="#erc1066">Interface EIP-1066</a></li>
        <li><a href="#forcetransfer">Force Transfer</a></li>
      </ul>
    </li>
  </ol>
</details>
<details close>
  <summary>FRENCH - Table des matières</summary>
  <ol>
    <li>
      <a href="#about-the-project-FR">À propos du projet</a>
      <ul>
        <li><a href="#built-with-FR">Construit avec</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started-FR">Pour commencer</a>
      <ul>
        <li><a href="#prerequisites-FR">Conditions préalables</a></li>
        <li><a href="#available-commands-FR">Commandes disponibles</a></li>
        <li><a href="#test-contract-FR">Test Smart Contracts</a></li>
        <li><a href="#good-practices-FR">Bonnes pratiques de Solidity</a></li>
      </ul>
    </li>
    <li>
      <a href="#contracts-FR">Security Token</a>
      <ul>
        <li><a href="#motivation-FR">EIP 3643</a></li>
        <li><a href="#error-FR">Erreurs</a></li>
        <li><a href="#event-FR">Événements</a></li>
        <li><a href="#roles-FR">Rôles</a></li>
        <li><a href="#freezing-FR">Gèle de token</a></li>
        <li><a href="#balance-FR">Solde</a></li>
        <li><a href="#erc1066-FR">Interface EIP-1066</a></li>
        <li><a href="#forcetransfer-FR">Transfert de force</a></li>
      </ul>
    </li>
  </ol>
</details>

<a name="about-the-project"></a>

## Project Description

D-Fundit is a **decentralised online crowdfunding platform** that allows entrepreneurs, artists and creators to **present their projects** to a wider audience and **raise funds** for them. Projects can include films, video games, gadgets, technology products, artworks, books and more.

The funding is **exclusively in cryptocurrency**, which offers many advantages:

  - Firstly, cryptocurrency transactions can be conducted in a **decentralised** manner, meaning that there is no need for intermediaries such as banks or payment processors to facilitate the transaction. This can lead to **lower transaction fees** and **faster** transaction processing.

  - In addition, cryptocurrency funding can offer a **higher level of security** and **anonymity** than traditional forms of funding. Cryptocurrency transactions are encrypted and stored in a blockchain, making them very difficult to tamper with or alter. In addition, cryptocurrency transactions can be conducted **without disclosing the contributor's personal information**, thus providing a **higher level of privacy**.

  - Finally, cryptocurrency funding can offer investors access to innovative projects that are not available via traditional forms of funding. Many blockchain and cryptocurrency projects are funded through ICOs (Initial Coin Offerings), which allow investors to back projects that have the potential to become leaders in their field.

D-Fundit allows creators to **set a funding goal** and **campaign duration**, and contributors can **support** the project by making a donation. If the project reaches its funding goal before the end of the campaign, the contributors are debited and the creator can use the money to complete the project. If the project does not reach its funding target, the contributors are not debited and the project will not be funded.

Each contributor holds a **share of the project** relative to his or her investment, and can **reclaim his or her stake at any time**, as long as there are funds remaining on the project's smart contract.

In short, D-Fundit allows creators to present their projects to a wider audience and raise funds for their realisation, while at the same time allowing contributors to **support** projects that interest them and **contribute to their realisation**.

<p align="right">(<a href="#readme-top">Back to top</a>)</p>

## Smart Contract Description

Our smart contracts **"security tokens"** represent a crowdfunding project, which is represented by [ERC-20](https://ethereum.org/fr/developers/docs/standards/tokens/erc-20/) compatible **security token**.

Each investment is made with a purchase of tokens, each token represents a share of the project, and can be redeemed at any time by the investor.

The funds invested are registered on the smart contract and the owner of the contract can retrieve funds under certain conditions within a timeframe that he or she will have established beforehand.

The [ERC-20](https://ethereum.org/fr/developers/docs/standards/tokens/erc-20/) standard gives the
following possibilities:

- Possibility of issuing a token (**mint**)
- Possibility of yielding a token (**transfer**)
- Possibility of removing a token (**burn**)
- Access to the balance of token held by a shareholder (**balance**)

The <a href="#contracts">Security Token</a> standard is a set of rules that you can find
<a href="#contracts">here</a>

Each **movement of its tokens** (token transfer) is recorded in a **security movement record** which stores the wallet address of the **issuer** and the **receiver** as well as the **date** and **type** of that movement.

The creation of **tokens** is possible through the interaction of any user who wishes to invest in this project through the smart contract.

There is a second type of smart contract, the **"factory token "** which lists all the **"security tokens "** deployed on the blockchain

## Blockchain Network

Our smart contracts can be deployed immediately on a *mainnet* such as **ethereum** and **polygon**, but also on *testnet* such as **goeli** and **mumbai**.

As our application is 100% decentralised (no back-end at all for complete decentralisation), it is not possible to save drafts of your projects, which is why a deployment on testnet can be a good training before a production deployment on mainnet.

<p align="right">(<a href="#readme-top">Back to top</a>)</p>

<a name="built-with"></a>

## Built With

- **Solidity Version** 0.8.11
- **truffle** 5.6.3
- **prettier-plugin-solidity** 1.0.0-rc.1
- **openzeppelin/contracts** 4.8.1
- **slither**
- **mythril**

<p align="right">(<a href="#readme-top">Back to top</a>)</p>

<a name="getting-started"></a>

## Getting Started

First of all you will need to install all the libraries to be able to launch the project, you can do
it with yarn.

```bash
yarn
```

<a name="prerequisites"></a>

## Prerequisites

Install [Ganache](https://trufflesuite.com/ganache/) locally, and start local network with them.

```bash
yarn ganache
```

<a name="available-commands"></a>

## Available commands

The **package.json** file contains a set of scripts to help on the development phase. Below is a
short description for each

- **"compile"** compile all contracts
- **"authorize-permission"** authorize permission for write files before slither and mythril usage
- **"slither"** run slither testing smart contracts
- **"mythril"** run mythril testing smart contracts
- **"test"** run all tests locally
- **"test-basic"** run tests linked to basic token
- **"test-security"** run tests linked to security token
- **"lint:sol"** lint solidity code according to rules
- **"lint:js"** lint javascript code according to rules
- **"lint"** lint solidity code

<p align="right">(<a href="#readme-top">Back to top</a>)</p>

### Solhint

This is an open source project for linting Solidity code. This project provides both Security and
Style Guide validations.

[You can find rules and explanations here](https://github.com/protofire/solhint/blob/master/docs/rules.md)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<a name="test-contract"></a>

## Tests Contracts

We test every function of our contracts in every possible context. We use **mocha** and
**eth-gaz-reporter** to perform our tests and get a visual rendering of the **gas costs** and the
price in euros depending on the current network congestion and the price of ethereum.

<p align="right">(<a href="#readme-top">back to top</a>)</p>
<a name="good-practices"></a>

## Solidity Good Practices

| Ref                                                                                                                                                                                                                                                                                | Description                                                                                                                                                                                                                                                        |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [byte32](https://ethereum.stackexchange.com/questions/11556/use-string-type-or-bytes32)                                                                                                                                                                                            | Use strings for dynamically allocated data, otherwise Byte32 is going to perform better. Bytes32 is also going to be better in gas                                                                                                                                 |
| [Use uint instead bool](https://ethereum.stackexchange.com/questions/39932/solidity-bool-size-in-structs)                                                                                                                                                                          | It's more efficient to pack multiple booleans in a uint256, and extract them with a mask. You can store 256 booleans in a single uint256                                                                                                                           |
| [.call()](https://medium.com/coinmonks/solidity-transfer-vs-send-vs-call-function-64c92cfc878a)                                                                                                                                                                                    | using call, one can also trigger other functions defined in the contract and send a fixed amount of gas to execute the function. The transaction status is sent as a boolean and the return value is sent in the data variable.                                    |
| [Interfaces](https://www.tutorialspoint.com/solidity/solidity_interfaces.htm)                                                                                                                                                                                                      | Interfaces are most useful in scenarios where your dapps require extensibility without introducing added complexity                                                                                                                                                |
| [Change State Local Variable](https://ethereum.stackexchange.com/questions/118754/is-it-more-gas-efficient-to-declare-variable-inside-or-outside-of-a-for-or-while)                                                                                                                | It's cheaper to to declare the variable outside the loop                                                                                                                                                                                                           |
| [CallData](https://medium.com/coinmonks/solidity-storage-vs-memory-vs-calldata-8c7e8c38bce)                                                                                                                                                                                        | It is recommended to try to use calldata because it avoids unnecessary copies and ensures that the data is unaltered                                                                                                                                               |
| [Pack your variables](https://mudit.blog/solidity-gas-optimization-tips/)                                                                                                                                                                                                          | Packing is done by solidity compiler and optimizer automatically, you just need to declare the packable functions consecutively                                                                                                                                    |
| [Type Function Visibility](https://www.ajaypalcheema.com/function-visibility-in-solidty/#:~:text=There%20are%20four%20types%20of,internal%20%2C%20private%20%2C%20and%20public%20.&text=private%20modifier%20specifies%20that%20this,by%20children%20inheriting%20the%20contract.) | This is the most restrictive visibility and more gas efficient                                                                                                                                                                                                     |
| [Delete Variable](https://mudit.blog/solidity-gas-optimization-tips/)                                                                                                                                                                                                              | If you don’t need a variable anymore, you should delete it using the delete keyword provided by solidity or by setting it to its default value                                                                                                                     |
| [Immutable / constant variable](https://dev.to/jamiescript/gas-saving-techniques-in-solidity-324c)                                                                                                                                                                                 | Use constant and immutable variables for variable that don't change                                                                                                                                                                                                |
| [Unchecked state change](https://www.linkedin.com/pulse/optimizing-smart-contract-gas-cost-harold-achiando/)                                                                                                                                                                       | Add unchecked {} for subtractions where the operands cannot underflow                                                                                                                                                                                              |
| [Use revert instead of require](https://dev.to/jamiescript/gas-saving-techniques-in-solidity-324c)                                                                                                                                                                                 | Using revert instead of require is more gas efficient                                                                                                                                                                                                              |
| [Index events](https://ethereum.stackexchange.com/questions/8658/what-does-the-indexed-keyword-do)                                                                                                                                                                                 | The indexed parameters for logged events will allow you to search for these events using the indexed parameters as filters                                                                                                                                         |
| [Mythril](https://mythril-classic.readthedocs.io/en/master/about.html)                                                                                                                                                                                                             | Mythril is a security analysis tool for Ethereum smart contracts                                                                                                                                                                                                   |
| [Slither](https://medium.com/coinmonks/automated-smart-contract-security-review-with-slither-1834e9613b01)                                                                                                                                                                         | Automated smart contract security review with Slither                                                                                                                                                                                                              |
| [Reporter gaz](https://www.npmjs.com/package/eth-gas-reporter)                                                                                                                                                                                                                     | Gas usage per unit test                                                                                                                                                                                                                                            |
| [Reentrancy](https://solidity-by-example.org/hacks/re-entrancy/)                                                                                                                                                                                                                   | The Reentrancy attack is one of the most destructive attacks in the Solidity smart contract. A reentrancy attack occurs when a function makes an external call to another untrusted contract                                                                       |
| [Front Running](https://coinsbench.com/front-running-hack-solidity-10-57d0765d0179)                                                                                                                                                                                                | The attacker can execute something called the Front-Running Attack wherein, they basically prioritize their transaction over other users by setting higher gas fees                                                                                                |
| [Delegate Call](https://coinsbench.com/unsafe-delegatecall-part-1-hack-solidity-5-81d5f295edb6)                                                                                                                                                                                    | In order to update the owner of the HackMe contract, we pass the function signature of the pwn function via abi.encodeWithSignature(“pwn()”) from the malicious contract                                                                                           |
| [Self Destruct](https://hackernoon.com/how-to-hack-smart-contracts-self-destruct-and-solidity)                                                                                                                                                                                     | an attacker can create a contract with a selfdestruct() function, send ether to it, call selfdestruct(target) and force ether to be sent to a target                                                                                                               |
| [Block Timestamp Manipulation](https://cryptomarketpool.com/block-timestamp-manipulation-attack/)                                                                                                                                                                                  | To prevent this type of attack do not use block.timestamp in your contract or follow the 15 second rule. The 15 second rule states : If the scale of your time-dependent event can vary by 15 seconds and maintain integrity, it is safe to use a block.timestamp. |
| [Phishing with tx.origin](https://hackernoon.com/hacking-solidity-contracts-using-txorigin-for-authorization-are-vulnerable-to-phishing)                                                                                                                                           | Let’s say a call could be made to the vulnerable contract that passes the authorization check since tx.origin returns the original sender of the transaction which in this case is the authorized account                                                          |

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<a name="contracts"></a>

# Security Token

The smart contract security token is used as a security movement register, is ERC-20 compatible and
complies with the **EIP-3643** security token standards. <a name="motivation"></a>

## EIP-3643

Give standard interfaces for security tokens issued on Ethereum, through which any third party could
interact with the security token. The functions described by these interfaces vary and allow the
appropriate users to call a range of different actions, such as forced transfers, freeze tokens
(partially or totally on a wallet or even freeze the entire token), minting, burning, recover lost
tokens (if an investor loses access to his wallet), etc.

The following requirements have been compiled following discussions with parties across financial
institutions that are looking to issue securities on a DLT infrastructure such as ethereum.

- **MUST** be [ERC-20](https://ethereum.org/fr/developers/docs/standards/tokens/erc-20/) compatible.
- **MUST** be used in combination with an Identification system onchain
  ([ONCHAINID](https://github.com/onchain-id/solidity))
- **MUST** be able to apply any rule of compliance that is required by the regulator or by the token
  issuer (about the factors of eligibility of an identity or about the rules of the token itself)
- **MUST** have a standard interface to pre-check if a transfer is going to pass or fail before
  sending it to the blockchain
- **MUST** have a recovery system in case an investor loses access to his private key
- **MUST** be able to freeze tokens on the wallet of investors if needed, partially or totally
- **MUST** have the possibility to pause the token
- **MUST** be able to mint and burn tokens
- **MUST** define an Agent role and an Owner (token issuer) role
- **MUST** be able to force transfers from an Agent wallet
- **MUST** be able to issue transactions in batch (to save gas and to have all the transactions
  performed in the same block)
- **MUST** be upgradeable (code of the smart contract should be upgradeable without changing the
  token smart contract address)

<p align="right">(<a href="#readme-top">back to top</a>)</p>
<a name="event"></a>

## Events

Each entry in the smart contract will generate an **event**.

Event is an inheritable member of a contract. An event is emitted, it stores the arguments passed in
transaction logs. These logs are stored on blockchain and are accessible using address of the
contract till the contract is present on the blockchain.

An event generated is not accessible from within contracts, not even the one which have created and
emitted them.

```javascript
event TransferOwnership(address indexed oldAccount, address indexed newAccount);
event Transfer(string eventType, address indexed from, address indexed to, uint256 value);
event Paused(address indexed sender, uint256 indexed paused);
event AddressFrozen(address indexed userAddress, bool indexed freeze, address indexed sender);
event TokensFrozen(address indexed userAddress, uint256 indexed amount);
event TokensFrozenPeriod(address indexed userAddress, uint256 indexed startTime, uint256 indexed endTime, uint256 amount, address signer);
event TokensUnfrozen(address indexed userAddress, uint256 indexed amount);
event TokensUnfrozenPeriod(address indexed userAddress, uint256 indexed amount);
event IdentityRegistryAdded(address indexed _identityRegistry);
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>
<a name="error"></a>

## Errors

Errors are handled using **Customs Errors** Solidity, allowing for more complete error tracking.

```javascript
error NotTheOwner(address sender, bytes32 role);
error TransferFromZeroAddress(address from);
error TransferToZeroAddress(address to);
error TransferAmountExceedsBalance( uint256 fromBalance, address from, uint256 amount);
error MintFromZeroAddress(address account);
error MintDoesNotWork(address account, uint256 previousBalance, uint256 currentBalance, uint256 amount);
error BurnFromZeroAddress(address account);
error BurnAmountExceedsBalance(address account, uint256 accountBalance, uint256 amount);
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>
<a name="roles"></a>

## Roles

Different roles were created for the use of our smart contract.

- **Owner** : Is the role given by default to the smart contract deployer, it is the only one wallet
  address can perform all the functions of the contract without worrying about care about
  privileges.
- **Agent** : This role is one of the most important, it allows you to add identities, force a
  transfer, freeze an address or pause the contract.
- **Reader** : This role only allows to call the `transfers()` function which gives the possibility
  to retrieve the securities movement register

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Functions

<a name="freezing"></a>

### Freezing

There are several ways to freeze tokens in the contract.

The main one being the total contract pause, which stops all token transfers, from all addresses,
this function can be set in time, and the transfer of tokens will automatically resume once this
date has passed.

```javascript
function pause(uint256 _paused) external onlyAgent whenNotPaused

function unpause() external onlyAgent whenPaused
```

A single address can be completely frozen from any transfer, mint, burn of tokens by an agent or the
owner with `setAddressFrozen`, multiple addresses can be frozen per batch with
`batchSetAddressFrozen`, and it can be checked if an address is frozen with `isFrozen`

```javascript
function setAddressFrozen(address userAddress, bool freeze) public onlyAgent

function batchSetAddressFrozen(address[] calldata userAddresses, bool[] calldata freeze) external

function isFrozen(address userAddress) external view onlyReader returns (bool)
```

The tokens of an address can also be partially frozen, for example, for an address with 10 tokens,
only 5 of its tokens can be frozen, the other 5 will remain available for transfer, this can be done
for a **single** address with `freezePartialTokens` and `unfreezePartialTokens`, or it can be done
by **batch** with `batchFreezePartialTokens` and `batchUnfreezePartialTokens`

```javascript
function freezePartialTokens(address userAddress, uint256 amount) public onlyAgent

function batchFreezePartialTokens(address[] calldata userAddresses, uint256[] calldata amounts) external

function unfreezePartialTokens(address userAddress, uint256 amount) public onlyAgent

function batchUnfreezePartialTokens(address[] calldata userAddresses, uint256[] calldata amounts) external

function getFrozenTokens(address userAddress) external view returns (uint256)
```

The tokens of an address can also be frozen in a **partial** and **periodic** way, for example, for
an address with 10 tokens, we can freeze only 5 of its tokens for 5 months, the other 5 will remain
available for transfer, and 1 token to be unlocked per month with the `redeemFreezedTokens`
function.

This can be done for a **single** address with `setFreezedTokensPeriod` and the tokens can be
claimed with `redeemFreezedTokens`, it is also possible to check how many tokens are currently
unlockable with `unlockableTokensPeriod`

```javascript
function setFreezedTokensPeriod(
    uint256 startTime,
    uint256 endTime,
    uint256 amountFreezed,
    address userAddress
) external onlyAgent

function myFreezedTokensPeriod() external view returns (TokenLibrary.FreezePeriod memory)

function unlockableTokensPeriod() public view returns (uint256)

function redeemFreezedTokens() external returns (bool)
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>
<a name="balance"></a>

### Balance

There are two ways to retrieve the token balance from users.

The first is `balanceOf` which returns the number of tokens owned by a wallet address, without
taking into account partial or periodic token freezes.

```javascript
function balanceOf(address account) public view virtual override returns (uint256)
```

The second is `eligibleBalanceOf` which returns the number of tokens owned by a wallet address,
taking into account partial or periodic token freezes.

```javascript
function eligibleBalanceOf(address account) public view returns(uint256)
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<a name="erc1066"></a>

## ERC1066 interface for reason codes

To improve the token holder experience, `canTransfer` **MUST** return a reason byte code on
**success** or **failure** based on the **ERC1066** application-specific status codes specified
below. An implementation can also return arbitrary data as a **bytes32** to provide additional
information not captured by the reason code.

```javascript
 * Code	Reason
 * 0x50	transfer failure
 * 0x51	transfer success
 * 0x52	insufficient balance
 * 0x53	insufficient allowance
 * 0x54	transfers halted (contract paused)
 * 0x55	funds locked (lockup period)
 * 0x56	invalid sender
 * 0x57	invalid receiver
 * 0x58	invalid operator (transfer agent / owner)
 * 0x59
 * 0x5a frozen sender
 * 0x5b frozen receiver
 * 0x5c
 * 0x5d
 * 0x5e
 * 0x5f	token meta or info
```

<p align="right">(<a href="#readme-top">Back to top</a>)</p>

<a name="forcetransfer"></a>

## Force Transfer

A forced transfer is a feature that can be implemented in a security token to force token holders to
transfer their assets to another account or user.

_Forced transfer is often used in the following situations:_

- _For regulatory reasons: regulatory authorities may require a forced transfer of tokens for
  compliance or investor protection reasons._
- _For security reasons: in some situations, the founders of a project may need to force a transfer
  of tokens to protect investors and the stability of the project_
- _For tax compliance reasons: governments may require a forced transfer of tokens to ensure proper
  tax collection._

_It is important to note that forced transfers can restrict users' freedom and undermine trust in
the system. It is important to note that forced transfers can restrict users' freedom and undermine
trust in the system. Therefore, it is important to carefully assess the potential consequences
before implementing a forced transfer on a security token._

Executing the function will unlock the frozen tokens that you wish to forcibly transfer.

```javascript
function forcedTransfer(
    address from,
    address to,
    uint256 amount
) public onlyAgent returns (bool)
```

<p align="right">(<a href="#readme-top">retour au début</a>)</p>

<br /><br />

# FRENCH README

<br /><br />

<a name="about-the-project-FR"></a>

## Description du projet

D-Fundit est une **plateforme de financement participatif décentralisé** en ligne qui permet aux entrepreneurs, artistes et créateurs de **présenter leurs projets** à un public plus large et de **collecter des fonds pour les réaliser**. Les projets peuvent inclure des films, des jeux vidéo, des gadgets, des produits technologiques, des œuvres d'art, des livres et bien plus encore.

Le financement ce fait **exclusivement en cryptomonnaie**, ce qui offres de nombreux avantages :

  - Tout d'abord, les transactions en cryptomonnaie peuvent être effectuées de manière **décentralisée**, ce qui signifie qu'il n'y a pas besoin d'intermédiaires tels que les banques ou les processeurs de paiement pour faciliter la transaction. Cela peut entraîner des **frais de transaction plus bas** et une plus **grande rapidité de traitement** des transactions.

  - En outre, le financement en cryptomonnaie peut offrir un niveau de **sécurité** et d'**anonymat** plus élevé que les formes de financement traditionnelles. Les transactions en cryptomonnaie sont **cryptées** et enregistrées dans une blockchain, ce qui les rend très difficiles à falsifier ou à altérer. De plus, les transactions en cryptomonnaie peuvent être effectuées **sans divulguer les informations personnelles du contributeur**, offrant ainsi un niveau de **confidentialité** supérieur.

  - Enfin, le financement en cryptomonnaie peut offrir aux investisseurs un accès à des projets innovants qui ne sont pas disponibles via les formes de financement traditionnelles. De nombreux projets de blockchain et de cryptomonnaie sont financés par des ICO (Initial Coin Offerings), qui permettent aux investisseurs de **soutenir** des projets qui ont le potentiel de devenir des leaders dans leur domaine.

D-Fundit permet aux créateurs de **définir un objectif de financement** et une **durée de campagne**, et les contributeurs peuvent **soutenir** le projet en faisant un don. Si le projet atteint son objectif de financement avant la fin de la campagne, les contributeurs sont débités et le créateur peut utiliser l'argent pour réaliser le projet. Si le projet n'atteint pas son objectif de financement, les contributeurs ne sont pas débités et le projet ne sera pas financé.

Chaque contributeurs détient une **part du projet** relative à son investissement, et peut **récupérer sa mise à tout moment**, du moment qu'il reste des fonds de financement sur le smart contract du projet.

En résumé, D-Fundit permet aux créateurs de présenter leurs projets à un public plus large et de collecter des fonds pour les réaliser, tout en permettant aux contributeurs de **soutenir** des projets qui les intéressent et de **contribuer à leur réalisation**.

<p align="right">(<a href="#readme-top">retour au début</a>)</p>

## Description Des Smart Contracts

Nos smart contract **"security tokens"** représente un projet en crowdfunding, ce dernier est représenté par des **security token** compatible [ERC-20](https://ethereum.org/fr/developers/docs/standards/tokens/erc-20/).

Chaque investissement ce réalise avec un achat de tokens, chaque token représente une part du projet, et peut être remboursser a tout moment par l'investisseur.

Les fonds investit sont enregistrer sur le smart contract et le possesseur du contrat peut récupérer des fonds sous certaines conditions dans le temps qu'il aura lui même établit au préalable.

Le standard [ERC-20](https://ethereum.org/fr/developers/docs/standards/tokens/erc-20/) donne les possibilités suivantes :

- Possibilité d’émettre un token (**mint**)
- Possibilité de céder un token (**transfert**)
- Possibilité de faire de supprimer un token (**burn**)
- Accès au solde de token détenu par un actionnaire (**balance**)

Le standard <a href="#contracts-FR">Security Token</a> est un ensemble de règles établies que vous pourrez trouver <a href="#contracts-FR">ici</a>

Chaque **mouvement de ses tokens** (transfer de tokens) est enregistré dans un **registre de mouvement de de titre** qui mémorise l'addresse wallet de l'**émetteurs** et du **récepteur** ainsi que la **date** et le **type** de ce mouvement.

La création de **tokens** est possible par l'interaction de n'importe quel utilisateur qui souhaite investir dans ce projet par le biais du smart contract.

Il existe un deuxième type de smart contract, le **"factory token"** qui répertorie l'ensemble des **"security tokens"** déployer sur la blockchain

## Réseau Blockchain

Nos smart contract peuvent être déployer immédiatement sur un *mainnet* tel que **ethereum** et **polygon**, mais aussi sur les *testnet* tel que **goeli** et **mumbai**.

Notre application étant 100 % décentralisé (absence total de back-end pour une décentralisation complète), il n'est pas possible d'enregistrer de brouillons de vos projets, voila pourquoi un déploiement sur testnet peut être un bon entrainement avant un déploiement en production sur mainnet.

<p align="right">(<a href="#readme-top">retour au début</a>)</p>

<a name="built-with-FR"></a>

## Construit avec

- **Solidity Version** 0.8.11
- **truffle** 5.6.3
- **prettier-plugin-solidity** 1.0.0-rc.1
- **openzeppelin/contracts** 4.8.1
- **slither**
- **mythril**

<a name="getting-started-FR"></a>

## Pour commencer

Tout d'abord vous devrez installer toutes les librairies pour pouvoir lancer le projet, vous pouvez
faire le faire avec yarn.

```bash
yarn
```

<a name="prerequisites-FR"></a>

## Conditions préalables

Installez [Ganache](https://trufflesuite.com/ganache/) localement, et démarrez le réseau local avec
eux.

```bash
yarn ganache
```

<p align="right">(<a href="#readme-top">retour au début</a>)</p>

<a name="available-commands-FR"></a>

## Commandes disponibles

Le fichier **package.json** contient un ensemble de scripts pour aider à la phase de développement.
Vous trouverez ci-dessous une courte description de chaque scripts :

- **"compile "** compile tous les contrats
- **"authorize-permission "** autorise l'écriture de fichiers avant l'utilisation de slither et
  mythril
- **"slither "** lancer l'outil slither sur les contrats intelligents
- **"mythril "** lancer l'audit de mythril sur les contrats intelligents
- **"test "** exécuter tous les tests localement
- **"test-basic "** exécuter les tests liés au Basic-token
- **"test-security "** Exécuter les tests liés au Security-token
- **"lint:sol "** lint le code solidity selon les règles en vigueur
- **"lint:js "** lint le code javascript selon les règles en vigueur
- **"lint "** lint la totalité du code

<p align="right">(<a href="#readme-top">retour au début</a>)</p>

### Solhint

Il s'agit d'un projet open source pour le lint du code Solidity. Ce projet fournit à la fois des
validations de sécurité et de guide de style.

[Vous pouvez trouver les règles et les explications ici](https://github.com/protofire/solhint/blob/master/docs/rules.md)

<p align="right">(<a href="#readme-top">retour au début</a>)</p>

<a name="test-contract-FR"></a>

## Tests Contracts

Nous testons chaque fonction de nos contrats dans tous les contextes possibles. Nous utilisons
**mocha** et **eth-gaz-reporter** pour effectuer nos tests et obtenir un rendu visuel des **coûts du
gaz** et du prix en euros en fonction de la congestion actuelle du réseau et du prix de l'ethereum.
Le prix en euros varie en fonction de la congestion actuelle du réseau et du prix de l'ethereum.

<p align="right">(<a href="#readme-top">retour au début</a>)</p>
<a name="good-practices-FR"></a>

## Solidity Good Practices

| Ref                                                                                                                                                                                                                                                                                | Description                                                                                                                                                                                                                                                                                               |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [byte32](https://ethereum.stackexchange.com/questions/11556/use-string-type-or-bytes32)                                                                                                                                                                                            | Utilisez les chaînes de caractères pour les données allouées dynamiquement, sinon Byte32 sera plus performant. Bytes32 sera également plus performant pour le gaz.                                                                                                                                        |
| [Use uint instead bool](https://ethereum.stackexchange.com/questions/39932/solidity-bool-size-in-structs)                                                                                                                                                                          | Il est plus efficace de regrouper plusieurs booléens dans un uint256, et de les extraire avec un masque. Vous pouvez stocker 256 booléens dans un seul uint256                                                                                                                                            |
| [.call()](https://medium.com/coinmonks/solidity-transfer-vs-send-vs-call-function-64c92cfc878a)                                                                                                                                                                                    | En utilisant .call, on peut également déclencher d'autres fonctions définies dans le contrat et envoyer une quantité fixe de gaz pour exécuter la fonction. L'état de la transaction est envoyé sous forme de booléen et la valeur de retour est envoyée dans la variable de données.                     |
| [Interfaces](https://www.tutorialspoint.com/solidity/solidity_interfaces.htm)                                                                                                                                                                                                      | Les interfaces sont particulièrement utiles dans les scénarios où vos applications nécessitent une extensibilité sans introduire de complexité supplémentaire.                                                                                                                                            |
| [Change State Local Variable](https://ethereum.stackexchange.com/questions/118754/is-it-more-gas-efficient-to-declare-variable-inside-or-outside-of-a-for-or-while)                                                                                                                | Il est plus économique de déclarer la variable en dehors de la boucle.                                                                                                                                                                                                                                    |
| [CallData](https://medium.com/coinmonks/solidity-storage-vs-memory-vs-calldata-8c7e8c38bce)                                                                                                                                                                                        | Il est recommandé d'essayer d'utiliser calldata parce qu'il évite les copies inutiles et garantit que les données ne sont pas altérées.                                                                                                                                                                   |
| [Pack your variables](https://mudit.blog/solidity-gas-optimization-tips/)                                                                                                                                                                                                          | L'empaquetage est effectué automatiquement par le compilateur et l'optimiseur de solidité, il suffit de déclarer les fonctions empaquetables consécutivement.                                                                                                                                             |
| [Type Function Visibility](https://www.ajaypalcheema.com/function-visibility-in-solidty/#:~:text=There%20are%20four%20types%20of,internal%20%2C%20private%20%2C%20and%20public%20.&text=private%20modifier%20specifies%20that%20this,by%20children%20inheriting%20the%20contract.) | Il s'agit de la visibilité la plus restrictive et la plus économe en gaz.                                                                                                                                                                                                                                 |
| [Delete Variable](https://mudit.blog/solidity-gas-optimization-tips/)                                                                                                                                                                                                              | Si vous n'avez plus besoin d'une variable, vous devez la supprimer à l'aide du mot clé delete fourni par solidity ou en lui donnant sa valeur par défaut.                                                                                                                                                 |
| [Immutable / constant variable](https://dev.to/jamiescript/gas-saving-techniques-in-solidity-324c)                                                                                                                                                                                 | Utilisez des variables constantes et immuables pour les variables qui ne changent pas.                                                                                                                                                                                                                    |
| [Unchecked state change](https://www.linkedin.com/pulse/optimizing-smart-contract-gas-cost-harold-achiando/)                                                                                                                                                                       | Ajouter unchecked {} pour les soustractions où les opérations ne peuvent pas déborder.                                                                                                                                                                                                                    |
| [Use revert instead of require](https://dev.to/jamiescript/gas-saving-techniques-in-solidity-324c)                                                                                                                                                                                 | L'utilisation de revert au lieu de require est plus efficace en termes de consommation de gaz.                                                                                                                                                                                                            |
| [Index events](https://ethereum.stackexchange.com/questions/8658/what-does-the-indexed-keyword-do)                                                                                                                                                                                 | Les paramètres indexés pour les événements enregistrés vous permettront de rechercher ces événements en utilisant les paramètres indexés comme filtres.                                                                                                                                                   |
| [Mythril](https://mythril-classic.readthedocs.io/en/master/about.html)                                                                                                                                                                                                             | Mythril est un outil d'analyse de la sécurité des contrats intelligents Ethereum.                                                                                                                                                                                                                         |
| [Slither](https://medium.com/coinmonks/automated-smart-contract-security-review-with-slither-1834e9613b01)                                                                                                                                                                         | Examen automatisé de la sécurité des contrats intelligents avec Slither                                                                                                                                                                                                                                   |
| [Reporter gaz](https://www.npmjs.com/package/eth-gas-reporter)                                                                                                                                                                                                                     | Consommation de gaz par unité d'essai                                                                                                                                                                                                                                                                     |
| [Reentrancy](https://solidity-by-example.org/hacks/re-entrancy/)                                                                                                                                                                                                                   | L'attaque par réentraînement est l'une des attaques les plus destructrices du contrat intelligent Solidity. Une attaque par réentrance se produit lorsqu'une fonction fait un appel externe à un autre contrat non fiable.                                                                                |
| [Front Running](https://coinsbench.com/front-running-hack-solidity-10-57d0765d0179)                                                                                                                                                                                                | L'attaquant peut exécuter une attaque appelée "Front-Running Attack", qui consiste à donner la priorité à sa transaction sur les autres utilisateurs en fixant des frais d'essence plus élevés.                                                                                                           |
| [Delegate Call](https://coinsbench.com/unsafe-delegatecall-part-1-hack-solidity-5-81d5f295edb6)                                                                                                                                                                                    | Afin de mettre à jour le propriétaire du contrat HackMe, nous passons la signature de la fonction pwn via abi.encodeWithSignature("pwn()") du contrat malveillant                                                                                                                                         |
| [Self Destruct](https://hackernoon.com/how-to-hack-smart-contracts-self-destruct-and-solidity)                                                                                                                                                                                     | Un attaquant peut créer un contrat avec une fonction selfdestruct(), lui envoyer de l'éther, appeler selfdestruct(target) et forcer l'envoi d'éther vers une cible.                                                                                                                                       |
| [Block Timestamp Manipulation](https://cryptomarketpool.com/block-timestamp-manipulation-attack/)                                                                                                                                                                                  | Pour éviter ce type d'attaque, n'utilisez pas block.timestamp dans votre contrat ou suivez la règle des 15 secondes. La règle des 15 secondes stipule : Si l'échelle de votre événement dépendant du temps peut varier de 15 secondes et maintenir l'intégrité, il est sûr d'utiliser un block.timestamp. |
| [Phishing with tx.origin](https://hackernoon.com/hacking-solidity-contracts-using-txorigin-for-authorization-are-vulnerable-to-phishing)                                                                                                                                           | Supposons qu'un appel au contrat vulnérable passe le contrôle d'autorisation puisque tx.origin renvoie l'expéditeur original de la transaction qui, dans ce cas, est le compte autorisé.                                                                                                                  |

<p align="right">(<a href="#readme-top">retour au début</a>)</p>

<a name="contracts-FR"></a>

# Security Token

Le jeton de sécurité du contrat intelligent est utilisé comme registre de mouvement de sécurité, il
est compatible ERC-20 et conforme aux normes **EIP-3643** relatives aux jetons de sécurité.
<a name="motivation-FR"></a>

## EIP-3643

Donnez des interfaces standard pour les jetons de sécurité émis sur Ethereum, à travers lesquelles
tout tiers pourrait interagir avec le jeton de sécurité. Les fonctions décrites par ces interfaces
varient et permettent aux utilisateurs appropriés d'appeler une gamme d'actions différentes, telles
que des transferts forcés, geler des jetons (partiellement ou totalement sur un portefeuille ou même
geler l'intégralité du jeton), frapper, graver, récupérer des jetons perdus ( si un investisseur
perd l'accès à son portefeuille), etc.

Les exigences suivantes ont été compilées à la suite de discussions avec des parties d'institutions
financières qui cherchent à émettre des titres sur une infrastructure DLT telle qu'Ethereum.

- **DOIT** être compatible
  [ERC-20](https://ethereum.org/fr/developers/docs/standards/tokens/erc-20/) .
- **DOIT** être utilisé en combinaison avec un système d'identification onchain
  ([ONCHAINID](https://github.com/onchain-id/solidity))
- **DOIT** être en mesure d'appliquer toute règle de conformité requise par le régulateur ou par
  l'émetteur du jeton (sur les facteurs d'éligibilité d'une identité ou sur les règles du jeton
  lui-même)
- **DOIT** avoir une interface standard pour pré-vérifier si un transfert va réussir ou échouer
  avant de l'envoyer à la blockchain
- **DOIT** avoir un système de récupération au cas où un investisseur perdrait l'accès à sa clé
  privée
- **DOIT** être en mesure de geler les jetons sur le portefeuille des investisseurs si nécessaire,
  partiellement ou totalement
- **DOIT** avoir la possibilité de mettre en pause le jeton
- **DOIT** être capable de frapper et de graver des jetons
- **DOIT** définir un rôle d'agent et un rôle de propriétaire (émetteur de jeton)
- **DOIT** pouvoir forcer les transferts depuis un portefeuille d'agent
- **DOIT** pouvoir émettre des transactions par lots (pour économiser de l'essence et pour que
  toutes les transactions soient effectuées dans le même bloc)
- **DOIT** être évolutif (le code du contrat intelligent doit être évolutif sans changer l'adresse
  du contrat intelligent du jeton)

<p align="right">(<a href="#readme-top">retour au début</a>)</p>
<a name="event-FR"></a>

## Événements

Chaque entrée dans le contrat intelligent génère un **événement**.

L'événement est un membre héritable d'un contrat. Un événement est émis, il stocke les arguments
passés dans les journaux de transactions. Ces journaux sont stockés sur la blockchain et sont
accessibles en utilisant l'adresse du contrat jusqu'à ce que le contrat soit présent sur la
blockchain. Un événement généré n'est pas accessible depuis les contrats, pas même ceux qui les ont
créés et émis.

```javascript
event TransferOwnership(address indexed oldAccount, address indexed newAccount);
event Transfer(string eventType, address indexed from, address indexed to, uint256 value);
event Paused(address indexed sender, uint256 indexed paused);
event AddressFrozen(address indexed userAddress, bool indexed freeze, address indexed sender);
event TokensFrozen(address indexed userAddress, uint256 indexed amount);
event TokensFrozenPeriod(address indexed userAddress, uint256 indexed startTime, uint256 indexed endTime, uint256 amount, address signer);
event TokensUnfrozen(address indexed userAddress, uint256 indexed amount);
event TokensUnfrozenPeriod(address indexed userAddress, uint256 indexed amount);
event IdentityRegistryAdded(address indexed _identityRegistry);
```

<p align="right">(<a href="#readme-top">retour au début</a>)</p>
<a name="error-FR"></a>

## Erreurs

Les erreurs sont traitées à l'aide de **Customs Errors** Solidity, ce qui permet un suivi plus
complet des erreurs.

```javascript
error NotTheOwner(address sender, bytes32 role);
error TransferFromZeroAddress(address from);
error TransferToZeroAddress(address to);
error TransferAmountExceedsBalance( uint256 fromBalance, address from, uint256 amount);
error MintFromZeroAddress(address account);
error MintDoesNotWork(address account, uint256 previousBalance, uint256 currentBalance, uint256 amount);
error BurnFromZeroAddress(address account);
error BurnAmountExceedsBalance(address account, uint256 accountBalance, uint256 amount);
```

<p align="right">(<a href="#readme-top">retour au début</a>)</p>
<a name="roles-FR"></a>

## Rôles

Différents rôles ont été créés pour l'utilisation de notre contrat intelligent.

- **Owner** : Est le rôle donné par défaut au déployeur du contrat intelligent, c'est le seul
  portefeuille dont l'adresse. peut exécuter toutes les fonctions du contrat sans se préoccuper de
  ses privilèges.
- **Agent** : Ce rôle est l'un des plus importants, il permet d'ajouter des identités, de forcer un
  transfert, de geler une adresse ou de mettre en pause le contrat.
- **Reader** : Ce rôle permet uniquement d'appeler la fonction `transfers()` qui donne la
  possibilité de de récupérer le registre des mouvements de titres

<p align="right">(<a href="#readme-top">retour au début</a>)</p>

## Fonctions

<a name="freezing-FR"></a>

### Gel des jetons

Il existe plusieurs façons de geler les jetons dans le contrat.

La principale étant la mise en pause totale du contrat, qui arrête tous les transferts de jetons,
depuis toutes les adresses, cette fonction peut être définie dans le temps, et le transfert de
jetons reprendra automatiquement une fois cette date est passée.

```javascript
function pause(uint256 _paused) external onlyAgent whenNotPaused

function unpause() external onlyAgent whenPaused
```

Une adresse unique peut être complètement gelée pour tout transfert, mint, burn de jetons par un
agent ou le propriétaire avec `setAddressFrozen`, plusieurs adresses peuvent être gelées par lot
avec `batchSetAddressFrozen`, et il est possible de vérifier si une adresse est gelée avec
`isFrozen`.

```javascript
function setAddressFrozen(address userAddress, bool freeze) public onlyAgent

function batchSetAddressFrozen(address[] calldata userAddresses, bool[] calldata freeze) external

function isFrozen(address userAddress) external view onlyReader returns (bool)
```

Les jetons d'une adresse peuvent aussi être partiellement gelés, par exemple, pour une adresse avec
10 jetons, seulement 5 de ses jetons peuvent être gelés, les 5 autres resteront disponibles pour le
transfert, ceci peut être fait pour une **unique** adresse avec `freezePartialTokens` et
`unfreezePartialTokens`, ou cela peut être fait par **batch** avec `batchFreezePartialTokens` et
`batchUnfreezePartialTokens`.

```javascript
function freezePartialTokens(address userAddress, uint256 amount) public onlyAgent

function batchFreezePartialTokens(address[] calldata userAddresses, uint256[] calldata amounts) external

function unfreezePartialTokens(address userAddress, uint256 amount) public onlyAgent

function batchUnfreezePartialTokens(address[] calldata userAddresses, uint256[] calldata amounts) external

function getFrozenTokens(address userAddress) external view returns (uint256)
```

Les jetons d'une adresse peuvent également être gelés de manière **partielle** et **périodique**,
par exemple, pour une adresse avec 10 jetons, nous pouvons geler seulement 5 de ses jetons pendant 5
mois, les 5 autres resteront disponibles pour le transfert, et 1 jeton à débloquer par mois avec la
fonction `redeemFreezedTokens`.

Cela peut être fait pour une **unique** adresse avec `setFreezedTokensPeriod` et les jetons peuvent
être réclamés avec `redeemFreezedTokens`, il est également possible de vérifier combien de jetons
sont actuellement déverrouillables avec `unlockableTokensPeriod`.

```javascript
function setFreezedTokensPeriod(
    uint256 startTime,
    uint256 endTime,
    uint256 amountFreezed,
    address userAddress
) external onlyAgent

function myFreezedTokensPeriod() external view returns (TokenLibrary.FreezePeriod memory)

function unlockableTokensPeriod() public view returns (uint256)

function redeemFreezedTokens() external returns (bool)
```

<p align="right">(<a href="#readme-top">retour au début</a>)</p>
<a name="balance-FR"></a>

### Balance

Il y a deux façons de récupérer le solde des jetons des utilisateurs.

La première est `balanceOf` qui retourne le nombre de jetons possédés par une adresse de
portefeuille, sans prendre en compte les gels partiels ou périodiques de jetons.

```javascript
function balanceOf(address account) public view virtual override returns (uint256)
```

La seconde est `eligibleBalanceOf` qui renvoie le nombre de jetons possédés par une adresse de
portefeuille, en prenant en compte les gels partiels ou périodiques de jetons.

```javascript
function eligibleBalanceOf(address account) public view returns(uint256)
```

<p align="right">(<a href="#readme-top">retour au début</a>)</p>

<a name="erc1066-FR"></a>

## Interface ERC1066 pour les codes de motif de réussite ou echec de transaction

Pour améliorer l'expérience du détenteur de jeton, `canTransfer` **DOIT** renvoyer un code de motif
en cas de **succès** ou d'**échec** basé sur les codes d'état spécifiques aux applications
**ERC1066** spécifiés ci-dessous.

Une implémentation peut également renvoyer des données arbitraires sous la forme d'un **bytes32**
afin de fournir des informations supplémentaires non capturées par le code de motif.

```javascript
 * Code	Reason
 * 0x50	transfer failure
 * 0x51	transfer success
 * 0x52	insufficient balance
 * 0x53	insufficient allowance
 * 0x54	transfers halted (contract paused)
 * 0x55	funds locked (lockup period)
 * 0x56	invalid sender
 * 0x57	invalid receiver
 * 0x58	invalid operator (transfer agent / owner)
 * 0x59
 * 0x5a frozen sender
 * 0x5b frozen receiver
 * 0x5c
 * 0x5d
 * 0x5e
 * 0x5f	token meta or info
```

<p align="right">(<a href="#readme-top">retour au début</a>)</p>

<a name="forcetransfer-FR"></a>

## Transfert de force

_Un transfert forcé est une fonctionnalité qui peut être implémentée dans un security token pour
obliger les détenteurs de tokens à transférer leurs actifs à un autre compte ou à un autre
utilisateur._

_Le transfert forcé est souvent utilisé dans les situations suivantes :_

- _Pour des raisons réglementaires: les autorités réglementaires peuvent exiger un transfert forcé
  de tokens pour des raisons de conformité ou de protection des investisseurs._
- _Pour des raisons de sécurité: dans certaines situations, les fondateurs d'un projet peuvent être
  amenés à forcer un transfert de tokens pour protéger les investisseurs et la stabilité du projet._
- _Pour des raisons de conformité fiscale: les gouvernements peuvent exiger un transfert forcé de
  tokens pour garantir la collecte correcte des impôts._

_Il est important de noter que les transferts forcés peuvent restreindre la liberté des utilisateurs
et nuire à la confiance dans le système. Par conséquent, il est important d'évaluer soigneusement
les conséquences potentielles avant de mettre en place un transfert forcé sur un security token._

L'éxecution de la fonction débloquera les jetons gelées que l'ont souhaite transféré de force.

```javascript
function forcedTransfer(
    address from,
    address to,
    uint256 amount
) public onlyAgent returns (bool)
```

<p align="right">(<a href="#readme-top">retour au début</a>)</p>
