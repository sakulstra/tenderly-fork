require("dotenv").config();
const axios = require("axios");
const ethers = require("ethers");
const { hexStripZeros, hexZeroPad } = require("@ethersproject/bytes");
const { keccak256 } = require("@ethersproject/keccak256");
const { defaultAbiCoder } = require("@ethersproject/abi");

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
  constructor(fork_id) {
    if (fork_id) this.fork_id = fork_id;
  }

  async init(forkNetworkId, chainId) {
    console.log(`Creating fork for ${forkNetworkId} on ${chainId}`);
    const response = await tenderly.post(
      `account/${TENDERLY_ACCOUNT}/project/${TENDERLY_PROJECT}/fork`,
      {
        network_id: forkNetworkId,
        chain_config: { chain_id: Number(chainId) },
      }
    );
    this.fork_id = response.data.simulation_fork.id;
    this.root = response.data.root_transaction.id;
  }

  async getHead() {
    const response = await tenderly.get(
      `account/${TENDERLY_ACCOUNT}/project/${TENDERLY_PROJECT}/fork/${this.fork_id}`
    );

    return response.data.simulation_fork.global_head;
  }

  async fund_account(address, amount) {
    if (!this.fork_id) throw new Error("Fork not initialized!");
    await tenderly.post(
      `account/${TENDERLY_ACCOUNT}/project/${TENDERLY_PROJECT}/fork/${this.fork_id}/balance`,
      { accounts: [address], amount }
    );
  }

  async deal(address, amount) {
    const head = await this.getHead();
    console.log(head);
    if (!this.fork_id) throw new Error("Fork not initialized!");
    const tokens = [
      //{ address: "0xae7ab96520de3a18e5e111b5eaab095312d7fe84", slot: 1 }, // stETH - doesn't work
      { address: "0x6b175474e89094c44da98b954eedeac495271d0f", slot: 2 }, // DAI (key slot) 2
      { address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", slot: 9 }, // USDC (key, slot) 9
      // "0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9", // AAVE (key, slot) 0
      // "0xba100000625a3754423978a60c9317c58a424e3d", // BAL (key slot) 1
    ];
    const storage = tokens.reduce((acc, token) => {
      acc[token.address] = {
        storage: {
          [getSolidityStoageSlotUint256(token.slot, address)]: hexZeroPad(
            ethers.utils.parseEther(String(amount)).toHexString(),
            32
          ),
        },
      };
      return acc;
    }, {});
    console.log("Funding various tokens");
    await tenderly.post(
      `account/${TENDERLY_ACCOUNT}/project/${TENDERLY_PROJECT}/fork/${this.fork_id}/simulate`,
      {
        from: "0x0000000000000000000000000000000000000000",
        to: "0xBd770416a3345F91E4B34576cb804a576fa48EB1",
        input: "0xef690cc0",
        gas: 1000000,
        gas_price: "0",
        value: 0,
        save: true,
        state_objects: storage,
        root: head,
      }
    );
    console.log("Funding complete");
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

/**
 * @notice Returns the storage slot for a Solidity mapping with bytes32 keys, given the slot of the mapping itself
 * @dev Read more at https://docs.soliditylang.org/en/latest/internals/layout_in_storage.html#mappings-and-dynamic-arrays
 * @param mappingSlot Mapping slot in storage
 * @param key Mapping key to find slot for
 * @returns Storage slot
 */
function getSolidityStorageSlotBytes(mappingSlot, key) {
  const slot = hexZeroPad(mappingSlot, 32);
  return hexStripZeros(
    keccak256(defaultAbiCoder.encode(["address", "uint256"], [key, slot]))
  );
}

function getSolidityStoageSlotUint256(mappingSlot, key) {
  return hexStripZeros(
    keccak256(
      defaultAbiCoder.encode(["uint256", "uint256"], [key, mappingSlot])
    )
  );
}

module.exports = { TenderlyFork };
