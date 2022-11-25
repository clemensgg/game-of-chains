'use strict';

const axios = require('axios');
const ObjectsToCsv = require('objects-to-csv')

const { Tx } = require('cosmjs-types/cosmos/tx/v1beta1/tx');
const { MsgRecvPacket } = require('cosmjs-types/ibc/core/channel/v1/tx');
const { PubKey } = require('cosmjs-types/cosmos/crypto/secp256k1/keys');
const { pubkeyToAddress } = require('@cosmjs/amino');

const config = {
    "chain": "sputnik",
    "addr_prefix": "cosmos",
    "rpc": "http://<YOUR-RPC-ENDPOINT>",
    "output": "./output.csv",    // must be .csv
    "startBlock": 1,             // must not be 0
    "maxBlocks": 0               // 0 to walk until latest block
}

function calculateFeeTotals(data) {
    data.forEach((relayer) => {
        if (relayer.hasOwnProperty('txs')) {
            let effectedTxs = 0;
            var totalTxs = 0;
            relayer.txs.forEach((tx) => {
                if (tx.effected) {
                    effectedTxs++;
                }
                totalTxs++
            });
            if (relayer.hasOwnProperty('totalTxs') == false) {
                relayer.totalVSCPackets = totalTxs;
                relayer.effectedVSCPackets = effectedTxs;
            }
            else {
                relayer.totalVSCPackets = parseInt(relayer.totalVSCPackets) + parseInt(totalTxs);
                relayer.effectedVSCPackets = parseInt(relayer.effectedVSCPackets) + parseInt(effectedTxs);
            }
            delete relayer.txs;
        }
    });
    return data;
}

function sortRelayTxs(txs, data) {
    txs.forEach((tx) => {
        let address = "";
        if (tx.authInfo.fee.granter == "") {
            if (tx.authInfo.signerInfos[0].publicKey.typeUrl.includes("ethsecp256k1.PubKey")) {
                let key = PubKey.toJSON(PubKey.decode(tx.authInfo.signerInfos[0].publicKey.value)).key.toString();
                let pubkey = PublicKey.fromBase64(key)
                address = pubkey.toAddress().toBech32(config.addr_prefix);
            }
            else {
                let key = PubKey.toJSON(PubKey.decode(tx.authInfo.signerInfos[0].publicKey.value)).key.toString();
                let pubkey = {
                    "type": "tendermint/PubKeySecp256k1",
                    "value": key
                }
                address = pubkeyToAddress(pubkey, config.addr_prefix);
            }
        }
        else address = tx.authInfo.fee.granter;
        
        var indb = false;
        for (var i = 0; i < data.length; i++) {
            if (data[i].address == address) {
                if (data[i].hasOwnProperty('txs')) {
                    data[i].txs.push(tx);
                }
                else data[i].txs = [tx]
                indb = true;
            }
        }
        if (indb == false) {
            data.push({
                "address": address,
                "txs": [tx]
            });
        }
    });
    return data;
}

async function blockwalker(maxblocks) {
    var results = [];
    var data = [];
    var block = 0;
    var repeat = true;
    while (repeat) {
        if (block == 0) {
            block = config.startBlock;
            console.log(`-> Start block: ${config.startBlock}, end block: ${config.startBlock + maxblocks} - walking blocks...`);
        }
        else console.log(`block ${block}`)
        try {
            var res = await axios.get(config.rpc + '/block?height=' + block);
        }
        catch (e) {
            console.log(e);
        }
        if (res) {
            block++;
            let txs = res.data.result.block.data.txs;
            let valsetUpdateCounter = 0;
            
            txs.forEach((tx) => {
                let buff = Buffer.from(tx, 'base64');
                let transaction = Tx.decode(buff);
                let msgs = transaction.body.messages;
                let isValsetUpdate = false;
                
                msgs.forEach((msg) => {
                    if (msg.typeUrl == '/ibc.core.channel.v1.MsgRecvPacket') {
                        msg.value = MsgRecvPacket.decode(msg.value);
                        // MsgRecvPacket on `channel-0`, `consumer` is a ValidatorSetChangePacket
                        if (msg.value.packet.destinationChannel == 'channel-0' && msg.value.packet.destinationPort == 'consumer') {
                            isValsetUpdate = true;
                        }
                    }
                });
                
                if (isValsetUpdate) {
                    delete transaction.body;
                    delete transaction.signatures;
                    if (valsetUpdateCounter == 0) {
                        transaction.effected = true;
                    } else transaction.effected = false;
                    results.push(transaction);
                    valsetUpdateCounter++;
                }
            });
            if (valsetUpdateCounter != 0) {
                console.log(`block ${block} recoreded valset updates: ${valsetUpdateCounter}`);
            }
        }
        
        // sort txs, calculate totals & purge tx data every 10k results to save RAM
        if (results.length >= 10000) {
            data = sortRelayTxs(results, data);
            data = calculateFeeTotals(data);
            results = [];
        }
        if (block >= (config.startBlock + maxblocks)) {
            data = sortRelayTxs(results, data);
            data = calculateFeeTotals(data);
            repeat = false;
        }
    }
    return data;
}

async function getLastBlock() {
    var tryCons = false;
    try {
        var res = await axios.get(config.rpc + '/status');
    }
    catch (e) {
        console.log(e);
        tryCons = true;
    }
    if (tryCons) {
        try {
            var res = await axios.get(config.rpc + '/consensus_state');
        }
        catch (e) {
            return false;
        }
        return parseInt(res.data.result.round_state['height/round/step'].split('/')[0]) - 1;
    }
    return res.data.result.sync_info.latest_block_height;
}

async function main() {
    var maxblocks = config.maxBlocks;
    if (maxblocks == 0) {
        var latest = await getLastBlock();
        if (latest != false) {
            maxblocks = latest - config.startBlock;
        }
        else {
            console.log("Error fetching latest height, please check your endpoint");
            return;
        }
    }
    var data = await blockwalker(maxblocks);

    data.forEach((relayer) => {
        console.log(relayer.address);
        console.log(`total relayed VSC Packets: ${relayer.totalVSCPackets}`);
        delete relayer.txs;
    });

    const csv = new ObjectsToCsv(data)
    await csv.toDisk(config.output);
    console.log("done");
    return;
}

main();