'use strict';

import axios from 'axios';
import { createHash } from 'crypto';
import fs from 'fs/promises';

/* ------------------------ CONFIG ------------------------ */
const provider = {
    "id": "provider",
    "lcd": "http://0.0.0.0:26619",
    "start_height": 54001,
    "last_height": 0,
    "valset_data": [["height", "hash","total_vp"]]
}
const consumer = {
    "id": "sputnik",
    "lcd": "http://0.0.0.0:26629",
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

// fetch latest valset
async function fetchLatestValset(chain) {
    try {
        var res = await axios.get(chain.lcd + '/validatorsets/latest');
    }
    catch (e) {
        console.log(e.data);
        return false;
    }
    return res.data.result;
}

// fetch new valset
async function fetchNewValset(chain) {
    let res = await fetchLatestValset(chain);
    let height = res.block_height;
    if (height > chain.last_height) {
        console.log(chain.id + ' block: ' + res.block_height)
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
        }
        if (isUniqueHash(provider, cc_new_set.sha256hash)) {
            alertAndDumpSet(cc_new_set);
        }
    }
    return;
}

// fetch historic valsets of PC
async function fetchHistoricValsets(chain) {
    console.log("fetching historic valsets for chain " + chain.id + "...")
    let block = chain.start_height;
    let res = await fetchLatestValset(chain);
    let last_block = res.block_height;
    while (block <= last_block) {
        if (block == last_block) {
            res = await fetchLatestValset(chain);
            if (res) {
                last_block = res.block_height;
            }
        }
        try {
            res = await axios.get(chain.lcd + '/validatorsets/' + block);
        }
        catch (e) {
            console.log(e.data);
            return;
        }
        if (res) {
            res = res.data.result;

            let valset = res.validators;
            let complete_set = completeSet(valset, block);
            let unique_hash = isUniqueHash(chain, complete_set.sha256hash);
            if (unique_hash == true) {
                console.log('new set! height ' + block)
                appendSet(chain, complete_set);
            }
            console.log("fetched " + chain.id + " block " + block);

            // compare CC blocks
            if (chain.id == consumer.id) {
                let unique_hash = isUniqueHash(provider, complete_set.sha256hash);
                if (unique_hash) {
                    await alertAndDumpSet(complete_set);
                }
            }
            chain.last_height = block;
            block++;
        }
    }
    return;
}

async function main() {
    // compare all historic valsets
    await fetchHistoricValsets(provider);
    await fetchHistoricValsets(consumer);

    // save historic valset records to disk
    dumpValsetRecords()

    // compare live valsets
    setInterval(compareLiveValsets, 1000);
    compareLiveValsets();
    return;
}

main();