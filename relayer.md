## IBC Relayer

#### Update `2022/11/11` 
- running (and monitoring) an IBC relayer between PC and CS

#### Update `2022/11/12` 
- reported "stuck" packet with sequence `393` on channel `channel-2` port `transfer` of chain `provider`
```sh
ThreadId(01) fetched channel from source chain: IdentifiedChannelEnd { port_id: PortId("consumer"), channel_id: ChannelId("channel-0"), channel_end: ChannelEnd { state: Open, ordering: Ordered, remote: Counterparty { port_id: PortId("provider"), channel_id: Some(ChannelId("channel-2")) }, connection_hops: [ConnectionId("connection-0")], version: Version("\n-cosmos17xpfvakm2amg962yls6f84z3kell8c5lserqta\u{12}\u{1}1") } } chain=apollo
SUCCESS Summary {
    src: PendingPackets {
        unreceived_packets: [],
        unreceived_acks: [],
    },
    dst: PendingPackets {
        unreceived_packets: [
            Sequence(
                393,
            ),
            Sequence(
                394,
            ),
            Sequence(
                395,
            ),
            Sequence(
                396,
            ),
            Sequence(
                397,
            ),
            Sequence(
                398,
            ),
            Sequence(
                399,
            ),
        ],
        unreceived_acks: [],
    },
}
```
issue: IBC packet data cannot be fetched

`hermes`
```sh
hermes tx packet-recv --dst-chain apollo --src-chain provider --src-port provider --src-channel channel-2
2022-11-12T17:14:29.797788Z  INFO ThreadId(01) using default configuration from '/home/service/.hermes/config.toml'
2022-11-12T17:14:29.807037Z  INFO ThreadId(01) PacketRecvCmd{src_chain=provider src_port=provider src_channel=channel-2 dst_chain=apollo}: unreceived packets found: 6
2022-11-12T17:14:29.861376Z TRACE ThreadId(01) PacketRecvCmd{src_chain=provider src_port=provider src_channel=channel-2 dst_chain=apollo}:query_send_packet_events{h=0-73171}: start_block_events []
2022-11-12T17:14:29.861394Z TRACE ThreadId(01) PacketRecvCmd{src_chain=provider src_port=provider src_channel=channel-2 dst_chain=apollo}:query_send_packet_events{h=0-73171}: tx_events []
2022-11-12T17:14:29.861403Z TRACE ThreadId(01) PacketRecvCmd{src_chain=provider src_port=provider src_channel=channel-2 dst_chain=apollo}:query_send_packet_events{h=0-73171}: end_block_events []
2022-11-12T17:14:29.861413Z  INFO ThreadId(01) PacketRecvCmd{src_chain=provider src_port=provider src_channel=channel-2 dst_chain=apollo}: pulled packet data for 0 events; events_total=6 events_left=0
```
`rly`
```sh
Failed to relay packet from sequence    {"src_chain_id": "provider", "src_channel_id": "channel-2", "src_port_id": "provider", "dst_chain_id": "apollo", "dst_channel_id": "channel-0", "dst_port_id": "consumer", "channel_order": "ORDER_ORDERED", "error": "no ibc messages found for send_packet query: send_packet.packet_src_channel='channel-2' AND send_packet.packet_src_port='provider' AND send_packet.packet_sequence='393'"}
```

#### Update `2022/11/15` 
- updated `hermes` relayer to the provided Version that includes a fix for above problem

#### Update `2022/11/20` 
- added `ccv` branch to our existing relayer statistics script to be able to export IBC client-update stats for CCV relayers: https://github.com/clemensgg/relayer-fees-js/tree/ccv
- uploaded relayer statistics for `sputnik` and `apollo`

#### Update `2022/11/21` 
- added relayer for 3rd consumer chain `hero-1`

#### Update `2022/11/26` 
decomissioned our relayer after over 1k `VSC Packets` sucessfully relayed to give other teams a better chance to reach the target as well

#### Update `2022/11/29` 
updated [Game Of Chains relayed valsets statistics](./count-relayer-updates/README.md#game-of-chains-relayer-data)