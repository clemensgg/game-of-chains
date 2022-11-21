# Game Of Chains 2022
[Cosmoshub incentivized testnet for ICS (InterChain Security)](https://interchainsecurity.dev/game-of-chains-2022)

## CryptoCrew infrastructure contributions
**seed nodes:**

| chain-id | tendermint p2p address |
| ---------- | -----------------------------------------------------------------------------|
| `provider` | `8372500f2d1dfdcfbf9f0eccceb5e98d37f07b80@tenderseed.ccvalidators.com:29009` |
| `sputnik`  | `3aed29ec1ca96ea52299748c50bf7d908511068f@tenderseed.ccvalidators.com:29019` |
| `apollo`   | `c5f4b33d904adaeacc1ca05bfcd7376ca4d51519@tenderseed.ccvalidators.com:29029` |
| `hero-1`   | `fe7997dd631c2916189dc06f5ee59f27318b708b@tenderseed.ccvalidators.com:29039`

**ibc-relayer:**

| relayer software | chain-id | account address | explorer link |
| ---------| ---------- | ------------------------------------------------| ------ |
| hermes `v1.0.0` | `provider` | `cosmos15md2qvgma8lnvqv67w0umu2paqkqkhege2evgl` | [link](https://testnet.ping.pub/provider/account/cosmos15md2qvgma8lnvqv67w0umu2paqkqkhege2evgl) |
|          | `sputnik`  | `cosmos15md2qvgma8lnvqv67w0umu2paqkqkhege2evgl` | [link](https://testnet.ping.pub/sputnik/account/cosmos15md2qvgma8lnvqv67w0umu2paqkqkhege2evgl) |
|          | `apollo`   | `cosmos15md2qvgma8lnvqv67w0umu2paqkqkhege2evgl` | [link](https://testnet.ping.pub/apollo/account/cosmos15md2qvgma8lnvqv67w0umu2paqkqkhege2evgl) |
|          | `hero-1`   | `cosmos15md2qvgma8lnvqv67w0umu2paqkqkhege2evgl` | [link](https://testnet.ping.pub/hero/account/cosmos15md2qvgma8lnvqv67w0umu2paqkqkhege2evgl) |
| rly `v2.1.2` | `provider` | `cosmos1yvejj22t78s2vfk7slty2d7fs5lkc8rnnt3j9u` | [link](https://testnet.ping.pub/provider/account/cosmos1yvejj22t78s2vfk7slty2d7fs5lkc8rnnt3j9u) |
|          | `sputnik`  | `cosmos1yvejj22t78s2vfk7slty2d7fs5lkc8rnnt3j9u` | [link](https://testnet.ping.pub/sputnik/account/cosmos1yvejj22t78s2vfk7slty2d7fs5lkc8rnnt3j9u) |
|          | `apollo`   | `cosmos1yvejj22t78s2vfk7slty2d7fs5lkc8rnnt3j9u` | [link](https://testnet.ping.pub/apollo/account/cosmos1yvejj22t78s2vfk7slty2d7fs5lkc8rnnt3j9u) |
|          | `hero-1`   | `cosmos1yvejj22t78s2vfk7slty2d7fs5lkc8rnnt3j9u` | [link](https://testnet.ping.pub/hero/account/cosmos1yvejj22t78s2vfk7slty2d7fs5lkc8rnnt3j9u) |

**relayer config files:**

- [config.toml](./hermes-config.toml) - for [hermes](https://github.com/informalsystems/hermes) relayer (`ibc-rs`) by [Informal Systems](https://github.com/informalsystems)
- [config.yaml](./rly-config.yaml) - for [rly](https://github.com/cosmos/relayer) relayer (`ibc-go`) by [Strangelove Ventures](https://github.com/strangelove-ventures)

## Tasks by CryptoCrew
- [comparing validator sets of PC (provider chain) and CS (consumer chain)](./compare-valsets/)
- [Run a relayer between a provider and consumer chain that relays at least 500 validator set changes](./relayer.md)
- Submitted evidence for tasks `1`, `2`, `11`, `12`
- Task `22` get jailed 2x for downtime and unjail: jailed on apollo, unjailed on provider: [unjail tx 1](https://testnet.mintscan.io/goc-provider/txs/F8C805CC6D5FBDD2D5B853CDBB77F275C06762EE74E1FE7BD1E734BE88BAB047) / [unjail tx 2](https://testnet.mintscan.io/goc-provider/txs/DA206CD386B22F0E46ECCF6A9FF6ADB7CFD4005BBC437D5BAFD5E6D6F344A7F0)  

## PRs by CryptoCrew
- https://github.com/hyphacoop/ics-testnets/pull/18
- https://github.com/hyphacoop/ics-testnets/pull/42

## Links
- GOC main repo: https://github.com/hyphacoop/ics-testnets/tree/main/game-of-chains-2022
- ICS spec: https://github.com/cosmos/ibc/tree/main/spec/app/ics-028-cross-chain-validation
- `hermes` relayer: https://github.com/informalsystems/hermes
- `rly` relayer: https://github.com/cosmos/relayer