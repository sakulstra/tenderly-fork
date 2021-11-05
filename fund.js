const { TenderlyFork } = require("./tenderly");

const ETH_ADDRESS = process.env.ETH_ADDRESS;
const FORK_ID = process.env.FORK_ID;

if (!FORK_ID)
  throw new Error("you need to specify a FORK_ID to fund an address");

const fork = new TenderlyFork();

await fork.fund_account(ETH_ADDRESS, 10000);
