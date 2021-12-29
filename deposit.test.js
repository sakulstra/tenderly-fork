const { TenderlyFork } = require("./tenderly");
const {
  LendingPool,
  ChainId,
  API_ETH_MOCK_ADDRESS,
} = require("@aave/contract-helpers");
const {
  Eip1193Bridge,
} = require("@ethersproject/experimental/lib/eip1193-bridge");

// const { Wallet } = require("@ethersproject/wallet");
// const { JsonRpcProvider } = require("@ethersproject/providers");
// const { BigNumber } = require("@ethersproject/bignumber");
const { providers, Wallet } = require("ethers");

const DEFAULT_TEST_ACCOUNT = {
  privateKey:
    "0x54c6ae44611f38e662093c9a3f4b26c3bf13f5b8adb02da1a76f321bd18efe92",
  address: "0x56FB278a7191bdf7C5d493765Fec03E6EAdF72f1".toLowerCase(),
};

const fork = new TenderlyFork({ fork_network_id: ChainId.avalanche });

// class CustomizedBridge extends Eip1193Bridge {
//   chainId = 3030;

//   async sendAsync(...args) {
//     console.debug("sendAsync called", ...args);
//     return this.send(...args);
//   }

//   async send(...args) {
//     console.debug("send called", ...args);
//     const isCallbackForm =
//       typeof args[0] === "object" && typeof args[1] === "function";
//     let callback;
//     let method;
//     let params;
//     console.log(args);
//     if (isCallbackForm) {
//       callback = args[1];
//       method = args[0].method;
//       params = args[0].params;
//     } else {
//       method = args[0];
//       params = args[1];
//     }
//     if (method === "eth_requestAccounts" || method === "eth_accounts") {
//       if (isCallbackForm) {
//         callback({ result: [await this.signer.getAddress()] });
//       } else {
//         return Promise.resolve([await this.signer.getAddress()]);
//       }
//     }
//     if (method === "eth_chainId") {
//       if (isCallbackForm) {
//         callback(null, { result: this.chainId });
//       } else {
//         return Promise.resolve(this.chainId);
//       }
//     }
//     if (method === "eth_sendTransaction") {
//       if (!this.signer) {
//         throw new Error("eth_sendTransaction requires an account");
//       }

//       const req = JsonRpcProvider.hexlifyTransaction(
//         // @ts-ignore
//         params[0],
//         { from: true, gas: true }
//       );
//       const tx = await this.signer.sendTransaction(req);
//       return tx.hash;
//     }
//     try {
//       const result = await super.send(method, params);
//       console.debug("result received", method, params, result);
//       if (isCallbackForm) {
//         callback(null, { result });
//       } else {
//         return result;
//       }
//     } catch (error) {
//       if (isCallbackForm) {
//         callback(error, null);
//       } else {
//         throw error;
//       }
//     }
//   }
// }

describe("deposit", () => {
  beforeAll(async () => {
    await fork.init();
  });

  it("should work via a Eip1193Bridge", async () => {
    const rpc = fork.get_rpc_url();
    const provider = new providers.JsonRpcProvider(rpc, 3030);
    let signer = new Wallet(DEFAULT_TEST_ACCOUNT.privateKey);
    await fork.fund_account(signer.address, 10000);
    signer = signer.connect(provider);

    // generate txn
    const pool = new LendingPool(provider, {
      WETH_GATEWAY: "0x8a47F74d1eE0e2edEB4F3A7e64EF3bD8e11D27C8",
      LENDING_POOL: "0x4F01AeD16D97E3aB5ab2B501154DC9bb0F1A5A2C",
    });

    const txn = await pool.deposit({
      user: signer.address,
      reserve: API_ETH_MOCK_ADDRESS,
      amount: "1",
    });

    // const bridge = new CustomizedBridge(signer, provider);

    // execute txn
    for (const tx of txn) {
      await signer.sendTransaction(tx.tx());
    }
  });

  afterAll(async () => {
    await fork.deleteFork();
  });
});
