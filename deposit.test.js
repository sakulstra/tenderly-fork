const { TenderlyFork } = require("./tenderly");
const { LendingPool } = require("@aave/contract-helpers");
// const { Wallet } = require("@ethersproject/wallet");
// const { JsonRpcProvider } = require("@ethersproject/providers");
// const { BigNumber } = require("@ethersproject/bignumber");
const { providers, Wallet, BigNumber } = require("ethers");

const DEFAULT_TEST_ACCOUNT = {
  privateKey:
    "0x54c6ae44611f38e662093c9a3f4b26c3bf13f5b8adb02da1a76f321bd18efe92",
};

const fork = new TenderlyFork("a1d4b5cc-a0a7-4381-8086-3991b78ad5c4");

describe("deposit", () => {
  beforeAll(async () => {
    // await fork.init();
  });

  it("should work via JsonRpcProvider", async () => {
    // setup wallet & provider
    const rpc = fork.get_rpc_url();
    const provider = new providers.JsonRpcProvider(rpc, 3030);
    let signer = new Wallet(DEFAULT_TEST_ACCOUNT.privateKey);
    console.log(signer.address);
    // await fork.fund_account(signer.address);
    signer = signer.connect(provider);

    // generate txn
    const pool = new LendingPool(provider, {
      WETH_GATEWAY: "0xcc9a0B7c43DC2a5F023Bb9b738E45B0Ef6B06E04",
      LENDING_POOL: "0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9",
    });
    const txn = await pool.deposit({
      user: signer.address,
      reserve: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
      amount: "1",
    });
    // execute txn
    for (const tx of txn) {
      const { from, ...rest } = await txn[0].tx();
      console.log({
        ...rest,
        value: rest.value ? BigNumber.from(rest.value) : undefined,
      });
      await (
        await signer.sendTransaction({
          ...rest,
          value: rest.value ? BigNumber.from(rest.value) : undefined,
        })
      ).wait();
    }
  });

  it("should work via a Eip1193Bridge", () => {});

  afterAll(async () => {
    // await fork.deleteFork();
  });
});
