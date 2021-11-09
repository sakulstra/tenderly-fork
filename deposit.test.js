const { TenderlyFork } = require("./tenderly");
const {
  TxBuilderV2,
  API_ETH_MOCK_ADDRESS,
  Network,
} = require("@aave/protocol-js");
const { LendingPool, ChainId } = require("@aave/contract-helpers");
// const { Wallet } = require("@ethersproject/wallet");
// const { JsonRpcProvider } = require("@ethersproject/providers");
// const { BigNumber } = require("@ethersproject/bignumber");
const { providers, Wallet, BigNumber } = require("ethers");

const DEFAULT_TEST_ACCOUNT = {
  privateKey:
    "0x54c6ae44611f38e662093c9a3f4b26c3bf13f5b8adb02da1a76f321bd18efe92",
};

const fork = new TenderlyFork({ fork_network_id: ChainId.polygon });

describe("deposit", () => {
  beforeAll(async () => {
    await fork.init();
  });

  it("should work via JsonRpcProvider", async () => {
    // setup wallet & provider
    const rpc = fork.get_rpc_url();
    const provider = new providers.JsonRpcProvider(rpc, 3030);
    let signer = new Wallet(DEFAULT_TEST_ACCOUNT.privateKey);
    await fork.fund_account(signer.address);
    signer = signer.connect(provider);

    // generate txn
    const pool = new LendingPool(provider, {
      WETH_GATEWAY: "0xbEadf48d62aCC944a06EEaE0A9054A90E5A7dc97",
      LENDING_POOL: "0x8dFf5E27EA6b7AC08EbFdf9eB090F32ee9a30fcf",
    });

    const txn = await pool.deposit({
      user: signer.address,
      reserve: API_ETH_MOCK_ADDRESS,
      amount: "1",
    });

    // const txBuilder = new TxBuilderV2(Network.polygon, provider, undefined, {
    //   lendingPool: {
    //     [Network.polygon]: {
    //       proto: {
    //         LENDING_POOL: "0x8dFf5E27EA6b7AC08EbFdf9eB090F32ee9a30fcf",
    //         WETH_GATEWAY: "0xbEadf48d62aCC944a06EEaE0A9054A90E5A7dc97",
    //       },
    //     },
    //   },
    // });

    // const pool = txBuilder.getLendingPool("proto");

    // const txn = await pool.deposit({
    //   user: signer.address,
    //   reserve: API_ETH_MOCK_ADDRESS,
    //   amount: "1",
    // });

    // execute txn
    for (const tx of txn) {
      await (await signer.sendTransaction(await tx.tx())).wait();
    }
  });

  it("should work via a Eip1193Bridge", () => {});

  afterAll(async () => {
    await fork.deleteFork();
  });
});
