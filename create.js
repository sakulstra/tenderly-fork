const { TenderlyFork } = require("./tenderly");

const ETH_ADDRESS = process.env.ETH_ADDRESS;
const fork = new TenderlyFork();

async function main() {
  await fork.init();
  console.log("rpcUrl", fork.get_rpc_url());
  console.log("chainId", CHAIN_ID);
  console.log("");
  if (ETH_ADDRESS) await fork.fund_account(ETH_ADDRESS, 10000);
  console.log("setting locale storage");
  if (FORK_NETWORK_ID === "1") {
    console.log('localStorage.setItem("fork_enabled", "true")');
    console.log(`localStorage.setItem("forkNetworkId", ${CHAIN_ID})`);
    console.log(`localStorage.setItem("forkRPCUrl", "${fork.get_rpc_url()}")`);
  }
  if (FORK_NETWORK_ID === "137") {
    console.log('localStorage.setItem("polygon_fork_enabled", "true")');
    console.log(`localStorage.setItem("polygonForkNetworkId", ${CHAIN_ID})`);
    console.log(
      `localStorage.setItem("polygonForkRPCUrl", "${fork.get_rpc_url()}")`
    );
  }
  if (FORK_NETWORK_ID === "43114") {
    console.log('localStorage.setItem("avalanche_fork_enabled", "true")');
    console.log(`localStorage.setItem("avalancheForkNetworkId", ${CHAIN_ID})`);
    console.log(
      `localStorage.setItem("avalancheForkRPCUrl", "${fork.get_rpc_url()}")`
    );
  }
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
