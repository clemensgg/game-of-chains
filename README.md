# Game Of Chains 2022
[Cosmoshub incentivized testnet for ICS (InterChain Security)](https://interchainsecurity.dev/game-of-chains-2022)

## CryptoCrew infrastructure contributions
**seed nodes:**

| chain-id | tendermint p2p address |
| ---------- | -----------------------------------------------------------------------------|
| `provider` | `8372500f2d1dfdcfbf9f0eccceb5e98d37f07b80@tenderseed.ccvalidators.com:29009` |
| `sputnik`  | `3aed29ec1ca96ea52299748c50bf7d908511068f@tenderseed.ccvalidators.com:29019` |
| `apollo`   | `c5f4b33d904adaeacc1ca05bfcd7376ca4d51519@tenderseed.ccvalidators.com:29029` |
| `hero-1`   | `fe7997dd631c2916189dc06f5ee59f27318b708b@tenderseed.ccvalidators.com:29039` |
| `neutron`  | `919167501b299c98dbbb8ad3ed233aa314add27f@tenderseed.ccvalidators.com:29049` |
| `gopher`   | `e0a4a0704bbe72d252c541fa7a0da04e7400f589@tenderseed.ccvalidators.com:29059` |
| `duality`  | `c6074d581d5a93fdf8e13a1a6da41a142189c1a9@tenderseed.ccvalidators.com:29069` |
| `strange`  | `893515134aafa8c8c0ab02692d80b81d74336a3c@tenderseed.ccvalidators.com:29079` |

**ibc-relayer:**

#### Update 2022/11/26: 
decomissioned our relayer after well over 500 `VSC Packets` sucessfully relayed to give other teams a better chance to reach the target as well

| relayer software | chain-id | account address | explorer link | `VSC Packets` counted | `VSC Packets` queried | `VSC Packets` querylink |
| ---------| ---------- | ------------------------------------------------| ------------------ | --------- | --------- | ------------------ |
| hermes `v1.0.0` | `provider` | `cosmos15md2qvgma8lnvqv67w0umu2paqkqkhege2evgl` | [link](https://testnet.ping.pub/provider/account/cosmos15md2qvgma8lnvqv67w0umu2paqkqkhege2evgl) |
|          | `sputnik`  | `cosmos15md2qvgma8lnvqv67w0umu2paqkqkhege2evgl` | [link](https://testnet.ping.pub/sputnik/account/cosmos15md2qvgma8lnvqv67w0umu2paqkqkhege2evgl) | 591 | 373 | [link](http://23.88.7.177:26629/cosmos/tx/v1beta1/txs?events=message.sender%3D%27cosmos15md2qvgma8lnvqv67w0umu2paqkqkhege2evgl%27&events=message.action%3D%27%2Fibc.core.channel.v1.MsgRecvPacket%27&events=recv_packet.packet_dst_channel%3D%27channel-0%27&events=recv_packet.packet_dst_port%3D%27consumer%27) | 
|          | `apollo`   | `cosmos15md2qvgma8lnvqv67w0umu2paqkqkhege2evgl` | [link](https://testnet.ping.pub/apollo/account/cosmos15md2qvgma8lnvqv67w0umu2paqkqkhege2evgl) | 490 | 321 | [link](http://23.88.7.177:26639/cosmos/tx/v1beta1/txs?events=message.sender%3D%27cosmos15md2qvgma8lnvqv67w0umu2paqkqkhege2evgl%27&events=message.action%3D%27%2Fibc.core.channel.v1.MsgRecvPacket%27&events=recv_packet.packet_dst_channel%3D%27channel-0%27&events=recv_packet.packet_dst_port%3D%27consumer%27) | 
|          | `hero-1`   | `cosmos15md2qvgma8lnvqv67w0umu2paqkqkhege2evgl` | [link](https://testnet.ping.pub/hero/account/cosmos15md2qvgma8lnvqv67w0umu2paqkqkhege2evgl) | 270 | 0 | [link](http://23.88.7.177:26649/cosmos/tx/v1beta1/txs?events=message.sender%3D%27cosmos15md2qvgma8lnvqv67w0umu2paqkqkhege2evgl%27&events=message.action%3D%27%2Fibc.core.channel.v1.MsgRecvPacket%27&events=recv_packet.packet_dst_channel%3D%27channel-0%27&events=recv_packet.packet_dst_port%3D%27consumer%27) | 
| rly `v2.1.2` | `provider` | `cosmos1yvejj22t78s2vfk7slty2d7fs5lkc8rnnt3j9u` | [link](https://testnet.ping.pub/provider/account/cosmos1yvejj22t78s2vfk7slty2d7fs5lkc8rnnt3j9u) |
|          | `sputnik`  | `cosmos1yvejj22t78s2vfk7slty2d7fs5lkc8rnnt3j9u` | [link](https://testnet.ping.pub/sputnik/account/cosmos1yvejj22t78s2vfk7slty2d7fs5lkc8rnnt3j9u) | 619 | 220 | [link](http://23.88.7.177:26629/cosmos/tx/v1beta1/txs?events=message.sender%3D%27cosmos1yvejj22t78s2vfk7slty2d7fs5lkc8rnnt3j9u%27&events=message.action%3D%27%2Fibc.core.channel.v1.MsgRecvPacket%27&events=recv_packet.packet_dst_channel%3D%27channel-0%27&events=recv_packet.packet_dst_port%3D%27consumer%27) |
|          | `apollo`   | `cosmos1yvejj22t78s2vfk7slty2d7fs5lkc8rnnt3j9u` | [link](https://testnet.ping.pub/apollo/account/cosmos1yvejj22t78s2vfk7slty2d7fs5lkc8rnnt3j9u) | 394 | 68 | [link](http://23.88.7.177:26639/cosmos/tx/v1beta1/txs?events=message.sender%3D%27cosmos1yvejj22t78s2vfk7slty2d7fs5lkc8rnnt3j9u%27&events=message.action%3D%27%2Fibc.core.channel.v1.MsgRecvPacket%27&events=recv_packet.packet_dst_channel%3D%27channel-0%27&events=recv_packet.packet_dst_port%3D%27consumer%27) |


## Guides
**relayer setup guide and config files:**

CryptoCrew is providing a [quick-start setup guide on how to build an IBC relayer for game of chains](./relayer-config/README.md)

- [config.toml](./relayer-config/config.toml) - for [hermes](https://github.com/informalsystems/hermes) relayer (`ibc-rs`) by [Informal Systems](https://github.com/informalsystems)
- [config.yaml](./relayer-config/config.yaml) - for [rly](https://github.com/cosmos/relayer) relayer (`ibc-go`) by [Strangelove Ventures](https://github.com/strangelove-ventures)

## Relayer statistics
CryptoCrew is providing a script to analyze [statistics for relayed IBC ValidatorSetChangePacket updates](./count-relayer-updates/)

Using this script we're frequently updating IBC relayer statistics (last updated: 2022/11/29)
- [sputnik](./relayer_VSCupdates_sputnik.csv)
- [apollo](./relayer_VSCupdates_apollo.csv)
- [hero](./relayer_VSCupdates_hero.csv)
- [neutron](./relayer_VSCupdates_neutron.csv)
- [gopher](./relayer_VSCupdates_gopher.csv)
- [duality](./relayer_VSCupdates_duality.csv)
- [strange](./relayer_VSCupdates_strange.csv)

## Tasks by CryptoCrew
- Tasks `9` & `10` [comparing validator sets of PC (provider chain) and CS (consumer chain)](./compare-valsets/)
- [Run a relayer between a provider and consumer chain that relays at least 500 validator set changes](./relayer.md)
- Submitted evidence for tasks `1`, `2`, `3`, `4`, `6`, `11`, `12`
- Task `22` get jailed 2x for downtime and unjail: jailed on apollo, unjailed on provider: [unjail tx 1](https://testnet.mintscan.io/goc-provider/txs/F8C805CC6D5FBDD2D5B853CDBB77F275C06762EE74E1FE7BD1E734BE88BAB047) / [unjail tx 2](https://testnet.mintscan.io/goc-provider/txs/DA206CD386B22F0E46ECCF6A9FF6ADB7CFD4005BBC437D5BAFD5E6D6F344A7F0)  
- Vote no on wrong metadata proposal: [tx link](https://testnet.mintscan.io/goc-provider/6119CAA510DCEDAA62857F577EAF6D248B9C3CA12F21042D5DFDD13E44B5701F)

## PRs by CryptoCrew
- https://github.com/hyphacoop/ics-testnets/pull/18
- https://github.com/hyphacoop/ics-testnets/pull/42
- https://github.com/hyphacoop/ics-testnets/pull/46
- https://github.com/hyphacoop/ics-testnets/pull/53

## Links
- GOC main repo: https://github.com/hyphacoop/ics-testnets/tree/main/game-of-chains-2022
- ICS spec: https://github.com/cosmos/ibc/tree/main/spec/app/ics-028-cross-chain-validation
- `hermes` relayer: https://github.com/informalsystems/hermes
- `rly` relayer: https://github.com/cosmos/relayer