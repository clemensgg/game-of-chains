## IBC Relayer configs

This folder contains a small setup guide and configuration files for a high-performance IBC relayer.

## Relayer architecture

To successfully relay IBC packets you need to run private full nodes (custom pruning or archive node) on all networks you want to support. Since relaying-success highly depends on latency and disk-IO-rate it is currently recommended to service these full/archive nodes on the same machine as the relayer process.  

Because the relaying process needs to be able to query the chain back in height for at least 2/3 of the unstaking period ("trusting period") it is recommended to use pruning settings that will keep the full chain-state for a longer period of time than the unstaking period  

Hardware specs:  

- 16+ vCPUs or Intel or AMD 16 core CPU
- at least 64GB RAM
- 4TB+ nVME drives (single drive configuration for better throughput)


### Hermes (rust)

[https://hermes.informal.systems/](https://hermes.informal.systems)

Pre-requisites:

- latest go-version [https://golang.org/doc/install](https://golang.org/doc/install)
- Fresh Rust installation: For instructions on how to install Rust on your machine please follow the official Notes about Rust installation at [https://www.rust-lang.org/tools/install](https://www.rust-lang.org/tools/install)
- openssl for rust. The OpenSSL library with its headers is required. Refer to [https://docs.rs/openssl/0.10.38/openssl/](https://docs.rs/openssl/0.10.38/openssl/)

```sh
sudo apt install librust-openssl-dev
cargo install ibc-relayer-cli --bin hermes --locked
hermes version
hermes 1.1.0
```

_It is recommended to always build binaries on dedicated machine (dev-box), as dev dependencies (rust & go) shouldn't be on your production machine_  

### Local fullnode configuration

You need to run fullnode instances of every chain you want to relay, which needs some drive and port organization. This can be achieved with many methods (config files, vms, docker containers), to favor simplicity we like to use Environment variables in our systemd files:

- (gaiad.service)[./gaiad.service]
- (sputnikd.service)[./sputnikd.service]
- (apollod.service)[./apollod.service]
- (herod.service)[./herod.service]
- (neutrond.service)[./neutrond.service]
- (gopherd.service)[./gopherd.service]

### Hermes short guide (please note: DO NOT relay `gopher` using hermes)

Make hermes working directory, copy config-template to config directory:
```sh
mkdir -p $HOME/.hermes
mkdir -p $HOME/.hermes/keys
cp ./config.toml $HOME/.hermes
```

don't forget to edit config.toml to fit your port setup  

Store your mnemonic seed in a textfile `vim .mn`  
Add accounts to hermes' keyring (located in $HOME/.hermes/keys): 
```sh
hermes keys add --chain provider --mnemonic-file .mn
hermes keys add --chain sputnik --mnemonic-file .mn
hermes keys add --chain apollo --mnemonic-file .mn
hermes keys add --chain hero --mnemonic-file .mn
hermes keys add --chain neutron --mnemonic-file .mn
```

You can validate your hermes configuration file:
```sh
INFO ThreadId(01) using default configuration from '/home/service/.hermes/config.toml'
SUCCESS "configuration is valid"
```

Start your fullnodes, let them fully sync, then start hermes `hermes start`

#### Snippets

Query unreceived packets & acknowledgements (check if channels are "clear")
```sh
hermes query packet pending --chain <CHAIN_ID> --port <PORT_ID> --channel <CHANNEL_ID>
```

Clear channel
```sh
hermes clear packets --chain <CHAIN_ID> --port <PORT_ID> --channel <CHANNEL_ID>
```