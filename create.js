require("dotenv").config();
const { TenderlyFork } = require("./tenderly");

const ETH_ADDRESS = process.env.ETH_ADDRESS;
const fork = new TenderlyFork();

const CHAIN_ID = process.env.CHAIN_ID || 3030;
const FORK_NETWORK_ID = process.env.FORK_NETWORK_ID || "1";

async function main() {
  await fork.init(FORK_NETWORK_ID, CHAIN_ID);
  console.log("rpcUrl", fork.get_rpc_url());
  console.log("chainId", CHAIN_ID);
  console.log("address", ETH_ADDRESS);
  console.log("");
  if (ETH_ADDRESS) {
    console.log(`Funding ${ETH_ADDRESS} with 10000 of the native currency.`);
    // await fork.fund_account(ETH_ADDRESS, 10000);
    await fork.deal(ETH_ADDRESS, 100);
  } else {
    console.log("No ETH_ADDRESS was provided so funding is skipped.");
  }
  console.log(
    "To use this fork on the aave interface type the following commands in the console."
  );
  console.log("--------------");
  console.log(`localStorage.setItem('forkEnabled', 'true');`);
  console.log(`localStorage.setItem('forkBaseChainId', ${FORK_NETWORK_ID});`);
  console.log(`localStorage.setItem('forkNetworkId', ${CHAIN_ID});`);
  console.log(`localStorage.setItem("forkRPCUrl", "${fork.get_rpc_url()}");`);
  console.log("--------------");
  console.log("warning: the fork will be deleted once this terminal is closed");
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
