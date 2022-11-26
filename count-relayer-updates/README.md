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
view Game Of Chains relayer data:
- [sputnik](./export/sputnik_relayer-valset-updates.csv)
- [apollo](./export/apollo_relayer-valset-updates.csv)
- [hero](./export/hero_relayer-valset-updates.csv)
- [neutron](./export/neutron_relayer-valset-updates.csv)
- [gopher](./export/hero_relayer-valset-updates.csv)