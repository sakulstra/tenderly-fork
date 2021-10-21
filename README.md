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
localStorage.setItem("forkRPCUrl", "https://rpc.tenderly.co/fork/88f3e618-d7d5-4b3d-a986-b7b81ee21821")
```