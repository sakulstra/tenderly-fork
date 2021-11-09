require("dotenv").config();
const axios = require("axios");

const FORK_NETWORK_ID = process.env.FORK_NETWORK_ID || "1";
const CHAIN_ID = process.env.CHAIN_ID || 3030;
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

class TenderlyFork {
  constructor({ fork_id, fork_network_id, chain_id } = {}) {
    if (fork_id) this.fork_id = fork_id;
    this.fork_network_id = fork_network_id || FORK_NETWORK_ID;
    this.chain_id = chain_id || CHAIN_ID;
  }

  async init() {
    console.log(
      `Creating fork for ${this.fork_network_id} on ${this.chain_id}`
    );
    const response = await tenderly.post(
      `account/${TENDERLY_ACCOUNT}/project/${TENDERLY_PROJECT}/fork`,
      {
        network_id: this.fork_network_id.toString(),
        chain_config: { chain_id: Number(this.chain_id) },
      }
    );
    this.fork_id = response.data.simulation_fork.id;
  }

  async fund_account(address, amount) {
    if (!this.fork_id) throw new Error("Fork not initialized!");
    await tenderly.post(
      `account/${TENDERLY_ACCOUNT}/project/${TENDERLY_PROJECT}/fork/${this.fork_id}/balance`,
      { accounts: [address], amount }
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

module.exports = { TenderlyFork };
