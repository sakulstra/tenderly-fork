# Fork setup

## Installation

1. copy .env.test to .env and fill your credentials
2. `npm i` install dependencies

## Getting started

```
npm run start:mainnet
npm run start:polygon
npm run start:avalanche
```

This will console log sth like:

```
localStorage.setItem("polygon_fork_enabled", "true")
localStorage.setItem("forkNetworkId", 3030)
localStorage.setItem("forkRPCUrl", "https://rpc.tenderly.co/fork/<id>")
```

1. First copy the 3 statements to your browser console of a running aave app
2. Setup a metamask fork with networkID `3030` and rpc `https://rpc.tenderly.co/fork/<id>` -> switch to the network
3. Reload the metamask

You should now have a custom fork running with an addition of 1000 of the base network currency in your wallet.
In addition to that a new market should have appeared on the ui with a small `f` indicator.
This is the market of your fork.

Switch to the market and do whatever you want :tada:
