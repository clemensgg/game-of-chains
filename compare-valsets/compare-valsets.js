import axios from 'axios';
import { createHash } from 'crypto';
import fs from 'fs/promises';
import { createRequire } from "module";
const require = createRequire(import.meta.url);

const { Tx } = require('cosmjs-types/cosmos/tx/v1beta1/tx');
const { MsgUpdateClient } = require('cosmjs-types/ibc/core/client/v1/tx');
const { Header } = require('cosmjs-types/ibc/lightclients/tendermint/v1/tendermint');

/* ------------------------ CONFIG ------------------------ */
const provider = {
    "id": "provider",
    "rpc": "http://localhost:26617",
    "start_height": 50001,
    "last_height": 0,
    "valset_data": [["block_height", "block_time", "comment", "validators_hash", "computed_hash", "proposer_address", "total_vp"]]
}
const consumer = {
    "id": "sputnik",
    "rpc": "http://localhost:26627",
    "start_height": 1,
    "last_height": 0,
    "valset_data": [["block_height", "block_time", "comment", "validators_hash", "computed_hash", "proposer_address", "total_vp"]]
}
/* -------------------------------------------------------- */

// generate sha256 hash
function hash(string) {
    return createHash('sha256').update(string).digest('hex');
}

// format date string
function formatDate(d) {
    return `${d.getFullYear()}/${("0" + (d.getMonth() + 1)).slice(-2)}/${d.getDate()} ${("0" + d.getHours()).slice(-2)}:${("0" + d.getMinutes()).slice(-2)}:${("0" + d.getSeconds()).slice(-2)}`;
}

// async write file
async function writeFile(path, data) {
    try {
        await fs.writeFile(path, data);
    }
    catch (e) {
        console.log(e);
        return false;
    }
    return true;
}

// fetch rpc
async function fetchRpc(chain, method) {
    try {
        var res = await axios.get(chain.rpc + method);
    }
    catch (e) {
        console.log(e);
        return false;
    }
    return res.data.result;
}

// save all valset records
async function dumpValsetRecords() {
    let cc_file = './export/' + consumer.id + '_valsets_' + consumer.last_height + '.csv'
    let pc_file = './export/' + provider.id + '_valsets_' + provider.last_height + '.csv'
    let csvContent = ""
        + consumer.valset_data.map(e => e.join(",")).join("\n");
    let res = await writeFile(cc_file, csvContent);
    if (res) {
        console.log('saved CONSUMER set to file: ' + cc_file);
    }
    csvContent = ""
        + provider.valset_data.map(e => e.join(",")).join("\n");
    res = await writeFile(pc_file, csvContent);
    if (res) {
        console.log('saved PROVIDER set to file: ' + pc_file);
    }
    return true;
}

function alertAndDumpSet(cc_new_set, comment) {
    // alert log
    console.log('> INCONSISTENT VALSETS DETECTED!')
    console.log('CC height: ' + cc_new_set.height);
    if (comment.includes('INCONSISTENT')) {
        console.log('CC valset update ' + cc_new_set.computed_hash + ' not found in historic valsets of ' + provider.id + ' !')
    }
    if (comment.includes('WRONG_ORDER')) {
        console.log('CC valset update ' + cc_new_set.computed_hash + ' was received in the wrong order !')
    }
    console.log('CC dumping set');
    console.log(JSON.stringify(cc_new_set));
    // save valset to disk
    dumpValsetRecords();
    return true;
}

// fetch new valset
async function fetchNewValset(chain) {
    let res = await fetchRpc(chain, '/abci_info');
    let height = res.response.block_height;
    if (height > chain.last_block_height) {
        res = await fetchRpc(chain, '/validators?height=' + height + '&per_page=500');
        console.log(chain.id + ' block: ' + height);
        let valset = res.validators;
        let complete_set = parseCompleteSet(valset, height);
        chain.last_height = height;
        return complete_set;
    }
    return false;
}

// parse rpc block result
function parseBlock(res) {
    return {
        "height": res.block.header.height,
        "time": new Date(res.block.header.time),
        "validators_hash": res.block.header.validators_hash,
        "next_validators_hash": res.block.header.next_validators_hash,
        "proposer_address": res.block.header.proposer_address,
        "txs": res.block.data.txs
    };
}

// parse complete valset and generate hash
function parseCompleteSet(valset, block) {
    let total_vp = 0;
    let complete_set = {
        "height": block.height,
        "blocktime": block.time,
        "validators_hash": block.validators_hash,
        "proposer_address": block.proposer_address,
        "validators": {}
    };
    valset.forEach((validator) => {
        complete_set.validators[validator.address] = validator.voting_power;
        total_vp = total_vp + parseFloat(validator.voting_power);
    });
    complete_set.total_vp = total_vp;
    complete_set.computed_hash = hash(JSON.stringify(complete_set.validators));
    return complete_set;
}

// parse IBC client updates
function parseIbcTxs(block) {
    let results = [];
    let txs = block.txs;
    txs.forEach((tx) => {
        let buff = Buffer.from(tx, 'base64');
        let transaction = Tx.decode(buff);
        let msgs = transaction.body.messages;
        let authInfo = transaction.authInfo;
        msgs.forEach((msg) => {
            if (msg.typeUrl == '/ibc.core.client.v1.MsgUpdateClient') {
                msg.value = MsgUpdateClient.decode(msg.value);
                msg.value.header = Header.decode(msg.value.header.value);
                let ibcClientUpdate = msg;
                results.push({ "auth_info": authInfo, "client_update_data": ibcClientUpdate });
            }
        });
    });
    return results;
}

// append new valset of chain
function appendSet(chain, set, comment) {
    Object.entries(set.validators).forEach(validator => {
        const [address] = validator;
        if (chain.valset_data[0].indexOf(address) == -1) {
            chain.valset_data[0].push(address);
            let len = chain.valset_data.length;
            for (let i = 1; i < len; i++) {
                chain.valset_data[i].push(0);
            }
        }
    });
    let newRow = [set.height, formatDate(set.blocktime), comment, set.validators_hash, set.computed_hash, set.proposer_address, set.total_vp];
    let len = chain.valset_data[0].length;
    for (let i = 7; i < len; i++) {
        Object.entries(set.validators).forEach(validator => {
            const [address, voting_power] = validator;
            if (chain.valset_data[0][i] == address) {
                newRow[i] = parseFloat(voting_power);
            }
            else {
                if (Object.keys(set.validators).indexOf(chain.valset_data[0][i]) == -1) {
                    newRow[i] = 0;
                }
            }
        });
    }
    chain.valset_data.push(newRow);
    console.log('> new set: ' + chain.id + ' | valset_hash: ' + set.computed_hash);
    return;
}

// check if valset has already been reflected on chain, compare block times for consumer chains
function receivedInHeight(chain, complete_set) {
    let len = chain.valset_data.length;
    let received_in_height = false;
    for (var i = 0; i < len; i++) {
        if (new Date(complete_set.blocktime) > new Date(chain.valset_data[i][1])) {
            if (chain.valset_data[i][4] == complete_set.computed_hash) {
                received_in_height = chain.valset_data[i][0];
            }
        }
    }
    return received_in_height;
}

// check ordering of received VSC updates on provider chain
function receivedInOrder(hash, lastHash) {
    let len = provider.valset_data.length;
    let foundLastHash = false;
    for (var i = 0; i < len; i++) {
        if (provider.valset_data[i][4] == lastHash) {
            foundLastHash = true;
        }
        if (provider.valset_data[i][4] == hash) {
            if (foundLastHash) {
                return true;
            }
            else return false;
        }
    }
    return false;
}

// poll lcd every 1s and check for new blocks/valsets
async function compareLiveValsets() {
    let pc_new_set = await fetchNewValset(provider);
    let cc_new_set = await fetchNewValset(consumer);
    if (pc_new_set) {
        let received_in_height = receivedInHeight(provider, pc_new_set);
        if (!received_in_height) {
            appendSet(provider, pc_new_set);
        }
    }
    if (cc_new_set) {
        let received_in_height = receivedInHeight(consumer, cc_new_set);
        if (!received_in_height) {
            appendSet(consumer, cc_new_set);
            received_in_height = receivedInHeight(provider, cc_new_set);
            if (!received_in_height) {
                alertAndDumpSet(cc_new_set);
            }
        }

    }
    return;
}

// fetch historic valsets of PC
async function fetchHistoricBlocks(chain) {
    console.log("fetching historic blocks for chain " + chain.id + "...");
    let height = chain.start_height;
    let res = await fetchRpc(chain, '/abci_info');
    let last_block = parseInt(res.response.last_block_height);
    while (height <= last_block) {
        // fetch block
        let block = false;
        let ibc_updates = false;
        res = await fetchRpc(chain, '/block?height=' + height);
        if (res) {
            block = parseBlock(res);
            console.log("fetched " + chain.id + " | height " + block.height + " | block_time: " + formatDate(block.time));

            // parse IBC client updates
            if (chain.id == consumer.id) {
                ibc_updates = parseIbcTxs(block);
                if (ibc_updates.length > 0) {
                    let effected_update = ibc_updates[0];
                    let complete_set = parseCompleteSet(effected_update.client_update_data.value.header.trustedValidators.validators, block);
                    let comment = "IBC_CLIENT_UPDATE:PCPROPOSER/" + effected_update.client_update_data.value.header.trustedValidators.validators.proposer
                    let inconsistent = false
                    // check if IBC valset has been a historic valset of provider
                    let received_in_height = receivedInHeight(provider, complete_set);
                    if (!received_in_height) {
                        inconsistent = true
                        comment = "INCONSISTENT_IBC_CLIENT_UPDATE:PCPROPOSER/" + effected_update.client_update_data.value.header.trustedValidators.validators.proposer
                    }
                    appendSet(chain, complete_set, comment);
                    if (inconsistent) {
                        alertAndDumpSet(complete_set, comment);
                    }
                }
            }

            // fetch and append valset, compare if we're running consumer
            res = await fetchRpc(chain, '/validators?height=' + height + '&per_page=500');
            if (res) {
                chain.last_height = height;
                let valset = res.validators;
                let complete_set = parseCompleteSet(valset, block);
                let received_in_height = receivedInHeight(chain, complete_set);
                let comment = "";
                if (chain.id == provider.id) {
                    if (!received_in_height) {
                        comment = 'VSC_UPDATE';
                        appendSet(chain, complete_set, comment);
                    }
                }
                // compare CC sets
                else if (chain.id == consumer.id) {
                    if (!received_in_height) {
                        let inconsistent = false;
                        received_in_height = receivedInHeight(provider, complete_set);
                        if (received_in_height) {
                            comment = "VSC_UPDATE:PCHEIGHT/" + received_in_height;
                            if (consumer.valset_data.length > 2) {
                                let consumer_last_hash = consumer.valset_data[consumer.valset_data.length - 1][4];
                                if (receivedInOrder(complete_set.computed_hash, consumer_last_hash) == false) {
                                    comment = "WRONG_ORDER_VSC_UPDATE:RECEIVEDBEFOREHASH/" + consumer_last_hash;
                                    inconsistent = true;
                                }
                            }
                        }
                        else {
                            comment = "INCONSISTENT_VSC_UPDATE";
                            inconsistent = true;
                        }
                        appendSet(chain, complete_set, comment);
                        if (inconsistent) {
                            alertAndDumpSet(complete_set, comment);
                        }
                    }
                }

                // check if new blocks were made since we started
                if (height == last_block) {
                    res = await fetchRpc(chain, '/abci_info');
                    last_block = parseInt(res.response.last_block_height);
                }
                height++;
            }
        }
    }
    return;
}

async function main() {
    // compare all historic valsets
    await fetchHistoricBlocks(provider);
    await fetchHistoricBlocks(consumer);
    await fetchHistoricBlocks(provider);

    // save historic valset records to disk
    dumpValsetRecords();

    // compare live valsets
    setInterval(compareLiveValsets, 1000);
    compareLiveValsets();
    return;
}

main();