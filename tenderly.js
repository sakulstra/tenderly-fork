require("dotenv").config();
const axios = require("axios");

const FORK_NETWORK_ID = process.env.FORK_NETWORK_ID || "1";
const TENDERLY_KEY = process.env.TENDERLY_KEY;
const TENDERLY_ACCOUNT = process.env.TENDERLY_ACCOUNT;
const TENDERLY_PROJECT = process.env.TENDERLY_PROJECT;
if (!TENDERLY_KEY) throw new Error("Tenderly key not set!");
if (!TENDERLY_ACCOUNT) throw new Error("Tenderly account not set!");
if (!TENDERLY_PROJECT) throw new Error("Tenderly project not set!");

const tenderly = axios.create({
  baseURL: "https://api.tenderly.co/api/v1/",
  headers: {
    "X-Access-Key": TENDERLY_KEY,
  },
});

const CHAIN_ID = 3030;

class TenderlyFork {
  async init() {
    const response = await tenderly.post(
      `account/${TENDERLY_ACCOUNT}/project/${TENDERLY_PROJECT}/fork`,
      { network_id: FORK_NETWORK_ID, chain_config: { chain_id: CHAIN_ID } }
    );
    this.fork_id = response.data.simulation_fork.id;
  }

  async fund_account(address) {
    if (!this.fork_id) throw new Error("Fork not initialized!");
    await tenderly.post(
      `account/${TENDERLY_ACCOUNT}/project/${TENDERLY_PROJECT}/fork/${this.fork_id}/balance`,
      { accounts: [address] }
    );
  }

  get_rpc_url() {
    if (!this.fork_id) throw new Error("Fork not initialized!");
    return `https://rpc.tenderly.co/fork/${this.fork_id}`;
  }

  async deleteFork() {
    await tenderly.delete(
      `account/${TENDERLY_ACCOUNT}/project/${TENDERLY_PROJECT}/fork/${this.fork_id}`
    );
  }
}
const fork = new TenderlyFork();

async function main() {
  await fork.init();
  console.log("rpcUrl", fork.get_rpc_url());
  console.log("chainId", CHAIN_ID);
  console.log("");
  console.log("setting locale storage");
  console.log('localStorage.setItem("fork_enabled", "true")');
  console.log(`localStorage.setItem("forkNetworkId", ${CHAIN_ID})`);
  console.log(`localStorage.setItem("forkRPCUrl", "${fork.get_rpc_url()}")`);
}

main().catch(function (err) {
  console.error(err);
  process.exit(1);
});

// keep process alive
process.stdin.resume();

// delete fork on exit
process.on("SIGINT", function () {
  console.log("Caught interrupt signal");
  fork.deleteFork().then((d) => {
    console.log("fork deleted");
    process.exit(0);
  });
});
