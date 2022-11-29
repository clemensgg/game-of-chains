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
# Game Of Chains relayer data:
- [sputnik](./relayer_VSCupdates_sputnik.csv)
- [apollo](./relayer_VSCupdates_apollo.csv)
- [hero](./relayer_VSCupdates_hero.csv)
- [neutron](./relayer_VSCupdates_neutron.csv)
- [gopher](./relayer_VSCupdates_gopher.csv)
- [duality](./relayer_VSCupdates_duality.csv)
- [strange](./relayer_VSCupdates_strange.csv)