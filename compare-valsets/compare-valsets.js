import axios from 'axios';
import { createHash } from 'crypto';
import fs from 'fs/promises';

/* ------------------------ CONFIG ------------------------ */
const provider = {
    "id": "provider",
    "rpc": "http://localhost:26617",
    "start_height": 51925,
    "last_height": 0,
    "latest_height": 0,
    "valset_data": [["block_height", "block_time", "comment", "validators_hash", "computed_hash", "proposer_address", "total_vp"]]
}
const consumer = {
    "id": "sputnik",
    "rpc": "http://localhost:26627",
    "start_height": 1,
    "last_height": 0,
    "latest_height": 0,
    "valset_data": [["block_height", "block_time", "comment", "validators_hash", "computed_hash", "proposer_address", "total_vp"]]
}
/* -------------------------------------------------------- */

// generate sha256 hash
function hash(string) {
    return createHash('sha256').update(string).digest('hex').toUpperCase();
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
        console.error(e);
        return false;
    }
    return true;
}

// fetch rpc
async function fetchRpc(url, method) {
    try {
        var res = await axios.get(url + method);
    }
    catch (e) {
        console.error(e);
        return false;
    }
    return res.data.result;
}

// save all valset records
async function saveValsetRecords(chain) {
    let filename = './export/' + chain.id + '_valsets_' + chain.last_height + '.csv'
    let csvContent = ""
        + chain.valset_data.map(e => e.join(",")).join("\n");
    let res = await writeFile(filename, csvContent);
    if (res) {
        console.log('saved ' + chain.id + ' sets to file: ' + filename);
    }
    return true;
}

function alertInconsistentSet(cc_new_set, comment) {
    // alert log
    console.warn('CC height: ' + cc_new_set.height);
    if (comment.includes('INCONSISTENT')) {
        console.warn(consumer.id + ' valset update ' + cc_new_set.computed_hash + ' not found in historic valsets of ' + provider.id + ' !')
    }
    if (comment.includes('WRONG_ORDER')) {
        console.warn(consumer.id + ' valset update ' + cc_new_set.computed_hash + ' was received in the wrong order !')
    }
    console.warn('CC dumping set');
    console.warn(JSON.stringify(cc_new_set));
    return true;
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

// comparison function to sort validators by address
function compareAddresses(a, b) {
    let nameA = a.address.toLowerCase();
    let nameB = b.address.toLowerCase();
    if(nameA < nameB) {
        return -1;
    }
    if(nameA > nameB) {
        return 1;
    }
    return 0;
}

// comparison function to sort validators by voting_power
function comparVotingPower(a, b) {
    let vpA = toInt(a.voting_power);
    let vpB = toInt(b.voting_power);
    if(vpA < vpB) {
        return -1;
    }
    if(vpA > vpB) {
        return 1;
    }
    return 0;
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
    let hash_data = [];

    // sort valset by address and then by voting power
    valset.sort(compareAddresses).sort(comparVotingPower);

    valset.forEach((validator) => {
        hash_data.push(validator.address, validator.voting_power);
        complete_set.validators[validator.address] = validator.voting_power;
        total_vp = total_vp + toInt(validator.voting_power);
    });
    complete_set.total_vp = total_vp;
    complete_set.computed_hash = hash(JSON.stringify(hash_data));
    return complete_set;
}

// append new valset in csv
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
    console.log('> ' + comment + ' | chain: ' + chain.id + ' | valset_hash: ' + set.computed_hash);
    return;
}

// check if valset has already been reflected on chain, compare block times for consumer chains
function receivedInHeight(chain, complete_set) {
    let len = chain.valset_data.length;
    let received_in_height = false;
    if (len == 0) {
        return received_in_height;
    }
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
    let foundLastHash = false;
    let len = provider.valset_data.length;
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

// fetch historic valsets
async function fetchHistoricBlocks(chain) {
    console.log("fetching historic blocks for chain " + chain.id + "...");
    let height = chain.start_height;
    while (height <= chain.latest_height) {
        let rpc = chain.rpc;    
        
        // fetch block
        let block = false;
        let res = await fetchRpc(rpc, '/block?height=' + height);
        if (res) {
            block = parseBlock(res);
            console.log("fetched " + chain.id + " | height " + block.height + " | block_time: " + formatDate(block.time));

            // fetch valset
            res = await fetchRpc(rpc, '/validators?height=' + height + '&per_page=500');
            if (res) {
                chain.last_height = height;
                let valset = res.validators;
                let complete_set = parseCompleteSet(valset, block);
                let received_in_height = receivedInHeight(chain, complete_set);
                
                // if new set on provider, append new provider valsets
                let comment = "";
                if (chain.id == provider.id) {
                    if (!received_in_height) {
                        comment = 'NEW_VALSET';
                        appendSet(chain, complete_set, comment);
                    }
                }
                
                // compare consumer sets against provider
                else if (chain.id == consumer.id) {
                    
                    // if new set on consumer...
                    if (!received_in_height) {
                        let inconsistent = false;
                        
                        // if set has been a historic set of provider...
                        received_in_height = receivedInHeight(provider, complete_set);
                        if (received_in_height) {
                            comment = "NEW_VALSET:PCHEIGHT/" + received_in_height;
                            
                            // if we already recorded more than 1 valset updates on consumer...
                            if (consumer.valset_data.length >= 2) {
                                let consumer_last_hash = consumer.valset_data[consumer.valset_data.length - 1][4];
                                let consumer_last_comment = consumer.valset_data[consumer.valset_data.length - 1][2];
                                
                                // previous valset of consumer must be a historic valset of provider to check ordering...
                                if (consumer_last_comment.includes('NEW_VALSET:PCHEIGHT/')) {
                                    let received_in_order = receivedInOrder(complete_set.computed_hash, consumer_last_hash)
                                    
                                    // ...check if valset was reflected in wrong order on consumer (before previous valset on provider)
                                    if (!received_in_order) {
                                        comment = "WRONG_ORDER_VALSET:RECEIVEDBEFOREHASH/" + consumer_last_hash;
                                        inconsistent = true;
                                    }
                                }
                            }
                        }

                        // valset was not a historic set of provider
                        else {
                            comment = "INCONSISTENT_VALSET";
                            inconsistent = true;
                        }

                        // append new consumer valsets
                        appendSet(chain, complete_set, comment);
                        if (inconsistent) {
                            alertInconsistentSet(complete_set, comment);
                        }
                    }
                }
                height++;
            }
        }
    }
    return;
}

// fetch latest height for both provider and comsumer
async function fetchLatestHeights() {
    let res = await fetchRpc(provider.rpc, '/abci_info');
    provider.latest_height = parseInt(res.response.last_block_height);
    res = await fetchRpc(consumer.rpc, '/abci_info');
    consumer.latest_height = parseInt(res.response.last_block_height);
    return true;
}

async function main() {
    // fetch latest heights
    await fetchLatestHeights();

    // compare all historic valsets
    await fetchHistoricBlocks(provider);
    await fetchHistoricBlocks(consumer);

    // save historic valset records to disk
    saveValsetRecords(provider);
    saveValsetRecords(consumer);

    console.log('> done!')
    return;
}

main();


/* ---------------- compare live ---------------- */
/* -------------------------------------------------
// fetch new valset
async function fetchNewValset(chain) {
    let res = await fetchRpc(chain.rpc, '/abci_info');
    let height = res.response.block_height;
    if (height > chain.last_block_height) {
        res = await fetchRpc(chain.rpc, '/validators?height=' + height + '&per_page=500');
        console.log(chain.id + ' block: ' + height);
        let valset = res.validators;
        let complete_set = parseCompleteSet(valset, height);
        chain.last_height = height;
        return complete_set;
    }
    return false;
}
------------------------------------------------- */
/* -------------------------------------------------
// poll rpc every 1s and check for new blocks/valsets
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
                alertInconsistentSet(cc_new_set);
            }
        }
    }
    return;
}
------------------------------------------------- */
