# Game Of Chains 2022
Cosmoshub incentivized testnet for ICS (InterChain Security)

## CryptoCrew infrastructure contributions
- seed nodes:

| chain-id | tendermint p2p address |
| ---------- | -----------------------------------------------------------------------------|
| `provider` | `8372500f2d1dfdcfbf9f0eccceb5e98d37f07b80@tenderseed.ccvalidators.com:29009`
| `sputnik`  | |
| `apollo`   | |

- ibc relayer:

| relayer software | chain-id | account address | explorer link |
| ---------| ---------- | ------------------------------------------------| ------ |
| hermes `v1.0.0` | `provider` | `cosmos15md2qvgma8lnvqv67w0umu2paqkqkhege2evgl` | [link](https://testnet.ping.pub/provider/account/cosmos15md2qvgma8lnvqv67w0umu2paqkqkhege2evgl) |
|          | `sputnik`  | `cosmos15md2qvgma8lnvqv67w0umu2paqkqkhege2evgl` | [link](https://testnet.ping.pub/sputnik/account/cosmos15md2qvgma8lnvqv67w0umu2paqkqkhege2evgl) |
|          | `apollo`   | `cosmos15md2qvgma8lnvqv67w0umu2paqkqkhege2evgl` | [link](https://testnet.ping.pub/apollo/account/cosmos15md2qvgma8lnvqv67w0umu2paqkqkhege2evgl) |
| rly `v2.1.2` | `provider` | `cosmos1yvejj22t78s2vfk7slty2d7fs5lkc8rnnt3j9u` | [link](https://testnet.ping.pub/provider/account/cosmos1yvejj22t78s2vfk7slty2d7fs5lkc8rnnt3j9u) |
|          | `sputnik`  | `cosmos1yvejj22t78s2vfk7slty2d7fs5lkc8rnnt3j9u` | [link](https://testnet.ping.pub/sputnik/account/cosmos1yvejj22t78s2vfk7slty2d7fs5lkc8rnnt3j9u) |
|          | `apollo`   | `cosmos1yvejj22t78s2vfk7slty2d7fs5lkc8rnnt3j9u` | [link](https://testnet.ping.pub/apollo/account/cosmos1yvejj22t78s2vfk7slty2d7fs5lkc8rnnt3j9u) |

## Tasks
- [comparing validator sets of PC (provider chain) and CS (consumer chain)](./compare-valsets/)
- [Run a relayer between a provider and consumer chain that relays at least 500 validator set changes](./relayer.md)

## Links
- ICS spec: https://github.com/cosmos/ibc/tree/main/spec/app/ics-028-cross-chain-validation
- GOC main repo: https://github.com/hyphacoop/ics-testnets/tree/main/game-of-chains-2022
- `hermes` relayer: https://github.com/informalsystems/hermes
- `rly` relayer: https://github.com/cosmos/relayer