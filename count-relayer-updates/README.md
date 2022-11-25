# count-relayer-updates.js
uses Tendermint RPC endpoint to walk blocks, counts every `ValidatorSetChangePacket` for every relayer, outputs to .csv
- txs using fee-grant are assigned to the granter account

configure via config object:
```
vim count-relayer-updates.js
```
to run:
```
npm install
npm run start
```