require("dotenv").config();
const { TenderlyFork } = require("./tenderly");

const ETH_ADDRESS = process.env.ETH_ADDRESS;
const TOKEN_ADDRESS = process.env.CHAIN_ID.TOKEN_ADDRESS;
const fork = new TenderlyFork();

const CHAIN_ID = process.env.CHAIN_ID || 3030;
const FORK_NETWORK_ID = process.env.FORK_NETWORK_ID || "1";

async function main() {
  await fork.init(FORK_NETWORK_ID, CHAIN_ID);
  console.log("rpcUrl", fork.get_rpc_url());
  console.log("chainId", CHAIN_ID);
  console.log("");
  if (ETH_ADDRESS) {
    console.log(`Funding ${ETH_ADDRESS} with 10000 of the native currency.`);
    await fork.fund_account(ETH_ADDRESS, 10000);
    if(TOKEN_ADDRESS){
      await fork.getERC20Token(ETH_ADDRESS)
    }else{
      /**
       *  If u need more then one token need to uncomment under code and fill in list of objects where
       *
       *  tokenAddress - is token address
       *  donorAddress - if fork is not for mainnet need to put address of donor (wallet which have enough amount)
       *  tokenCount - if need more amount then defoult (10)
       */

      // const tokens = [
      //     { tokenAddress:"", donorAddress:"", tokenCount:""}
      // ];
      // await Promise.all(
      //     tokens.map((token) =>
      //         fork.getERC20Token(
      //             ETH_ADDRESS,
      //             token.tokenAddress,
      //             token.donorAddress,
      //             token.tokenCount
      //         )
      //     )
      // );
    }
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
