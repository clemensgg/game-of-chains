'use strict';

import axios from 'axios';
import { createHash } from 'crypto';
import fs from 'fs/promises';

// import { Tx } from 'cosmjs-types/cosmos/tx/v1beta1/tx';
// import { MsgUpdateClient } from 'cosmjs-types/ibc/core/client/v1/tx';
// import { Header } from 'cosmjs-types/ibc/lightclients/tendermint/v1/tendermint';
// import { PubKey } from 'cosmjs-types/cosmos/crypto/secp256k1/keys';
// import { pubkeyToAddress } from '@cosmjs/amino';

/* ------------------------ CONFIG ------------------------ */
const provider = {
    "id": "provider",
    "rpc": "http://...:26617",
    "start_height": 54001,
    "last_height": 0,
    "valset_data": [["height", "hash","total_vp"]]
}
const consumer = {
    "id": "sputnik",
    "rpc": "http://...:26627",
    "start_height": 1,
    "last_height": 0,
    "valset_data": [["height", "hash", "total_vp"]]
}
/* -------------------------------------------------------- */

// generate sha256 hash
function hash(string) {
    return createHash('sha256').update(string).digest('hex');
}

// async write file
async function writeFile(path, data) {
    try {
        await fs.writeFile(path, data);
    }
    catch (e) {
        console.log(e.data);
        return false;
    }
    return true;
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

function isUniqueHash(chain, hash) {
    let len = chain.valset_data.length;
    let unique_hash = true;
    for (var i = 0; i < len; i++) {
        if (chain.valset_data[i][1] == hash) {
            unique_hash = false;
        }
    }
    return unique_hash;
}

// fetch rpc
async function fetchRpc(chain, method) {
    try {
        var res = await axios.get(chain.rpc + method);
    }
    catch (e) {
        console.log(e.data);
        return false;
    }
    return res.data.result;
}

// fetch new valset
async function fetchNewValset(chain) {
    let res = await fetchRpc(chain, '/abci_info');
    let height = res.response.block_height;
    if (height > chain.last_block_height) {
        res = await fetchRpc(chain, '/validators?height=' + height + '&per_page=500');
        console.log(chain.id + ' block: ' + height);
        let valset = res.validators;
        let complete_set = completeSet(valset, height);
        chain.last_height = height;
        return complete_set;
    }
    return false;
}

// create complete valset object for csv output
function completeSet(valset, height) {
    let valset_export = [];
    let total_vp = 0;
    let complete_set = {
        "validators": {}
    };
    valset.forEach((validator) => {
        valset_export.push(validator.address, validator.voting_power);
        complete_set.validators[validator.address] = validator.voting_power;
        total_vp = total_vp + parseFloat(validator.voting_power);
    });
    complete_set.total_vp = total_vp;
    complete_set.height = height;
    complete_set.sha256hash = hash(valset_export.toString());
    return complete_set;
}

// append new valset of chain
function appendSet(chain, set) {
    Object.entries(set.validators).forEach(validator => {
        const [address] = validator;
        if (chain.valset_data.length == 0 || chain.valset_data[0].indexOf(address) == -1) {
            chain.valset_data[0].push(address);
            let len = chain.valset_data.length;
            for (let i = 1; i < len; i++) {
                chain.valset_data[i].push(0);
            }
        }
    });
    let newRow = [set.height, set.sha256hash, set.total_vp];
    let len = chain.valset_data[0].length;
    for (let i = 3; i < len; i++) {
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
    console.log('> new set: ' + chain.id + ' | height: ' + set.height + ' | valset_hash: ' + set.sha256hash);
    return;
}

async function alertAndDumpSet(cc_new_set) {
    // alert log
    console.log('> DIFFERING VALSETS DETECTED!')
    console.log('PC height: ' + provider.last_height);
    console.log('CC height: ' + cc_new_set.height);
    console.log('CC set ' + cc_new_set.sha256hash + ' not found in historic valsets of ' + provider.id + ' !')
    console.log('CC dumping ' + cc_new_set.height + ' set');
    console.log(JSON.stringify(cc_new_set));
    // save valset to disk
    dumpValsetRecords();
    return true;
}

// poll lcd every 1s and check for new blocks/valsets
async function compareLiveValsets() {
    let pc_new_set = await fetchNewValset(provider);
    let cc_new_set = await fetchNewValset(consumer);
    if (pc_new_set) {
        if (isUniqueHash(provider, pc_new_set.sha256hash)) {
            appendSet(provider, pc_new_set);
        }
    }
    if (cc_new_set) {
        if (isUniqueHash(consumer, cc_new_set.sha256hash)) {
            appendSet(consumer, cc_new_set);
            if (isUniqueHash(provider, cc_new_set.sha256hash)) {
                alertAndDumpSet(cc_new_set);
            }
        }
        
    }
    return;
}

// fetch historic valsets of PC
async function fetchHistoricValsets(chain, block) {
    console.log("fetching historic valsets for chain " + chain.id + "...")
    let res = await fetchRpc(chain, '/abci_info');
    let last_block = res.response.last_block_height;
    while (block <= last_block) {
        if (block == last_block) {
            res = await fetchRpc(chain, '/abci_info');
            last_block = res.response.last_block_height;
        }
        try {
            res = await fetchRpc(chain, '/validators?height=' + block + '&per_page=500');
        }
        catch (e) {
            console.log(e.data);
            return;
        }
        if (res) {
            let valset = res.validators;
            let complete_set = completeSet(valset, block);
            if (isUniqueHash(chain, complete_set.sha256hash)) {
                console.log('new set! height ' + block)
                appendSet(chain, complete_set);
                // compare CC sets
                if (chain.id == consumer.id) {
                    if (isUniqueHash(provider, complete_set.sha256hash)) {
                        await alertAndDumpSet(complete_set);
                    }
                }
            }
            console.log("fetched " + chain.id + " block " + block);
            chain.last_height = block;
            block++;
        }
    }
    return;
}

async function main() {
    // compare all historic valsets
    await fetchHistoricValsets(provider, provider.start_height);
    await fetchHistoricValsets(consumer, consumer.start_height);
    await fetchHistoricValsets(provider, provider.last_height);

    // save historic valset records to disk
    dumpValsetRecords();

    // compare live valsets
    setInterval(compareLiveValsets, 1000);
    compareLiveValsets();
    return;
}

main();