'use strict';

const axios = require('axios');
const { createHash } = require('crypto');
const ObjectsToCsv = require('objects-to-csv');

/* ------------------------ CONFIG ------------------------ */
const provider = {
    "id": "provider",
    "lcd": "http://<PROVIDER-REST-ENDPOINT>",
    "last_height": 0,
    "valsets": [],
    "valset_hashes": []
}
const consumer = {
    "id": "sputnik",
    "lcd": "http://<CONSUMER-REST-ENDPOINT>",
    "last_height": 0,
    "valsets": [],
}
/* -------------------------------------------------------- */

function hash(string) {
    return createHash('sha256').update(string).digest('hex');
}

// compare CC valset hash to every historic PC valset
function compareSet(cc_new_set) {
    let valid = false
    provider.valset_hashes.forEach((hash) => {
        if (hash == cc_new_set.sha256hash) valid = true;
    });
    return valid;
}

// append new valset of chain
function appendSet(chain, set) {
    if (chain == 'provider') {
        provider.valsets.unshift(set.valset);
        provider.last_height = set.height;
        provider.valset_hashes.push(set.sha256hash)
        if (provider.valsets.length > 1000) provider.valsets.pop();
    }
    if (chain == 'consumer') {
        consumer.valsets.unshift(set.valset);
        consumer.last_height = set.height;
        if (consumer.valsets.length > 1000) consumer.valsets.pop();
    }
    console.log('> new set: ' + chain + ' | height: ' + set.height + ' | valset_hash: ' + set.sha256hash);
    return;
}

// fetch new valset
async function fetchNewValset(url, last_height) {
    try {
        var res = await axios.get(url + '/validatorsets/latest');
    }
    catch (e) {
        console.log(e);
        return false;
    }
    let height = res.data.result.block_height;
    if (height > last_height) {
        let valset = res.data.result.validators;
        let valset_export = [];
        valset.forEach((validator) => {
            valset_export.push(validator.address, validator.voting_power);
        });
        let valset_hash = hash(valset_export.toString());
        let complete_set = {
            "height": height,
            "valset": valset_export,
            "sha256hash": valset_hash
        }
        return complete_set;
    }
    return false;
}

// poll lcd every 1s and check for new blocks/valsets
async function fetchChains() {
    let pc_new_set = await fetchNewValset(provider.lcd, provider.last_height);
    let cc_new_set = await fetchNewValset(consumer.lcd, consumer.last_height);
    if (pc_new_set) {
        appendSet('provider', pc_new_set);
    }
    if (cc_new_set) {
        appendSet('consumer', cc_new_set);
        if (provider.valsets.length > 1) {
            let setIncluded = compareSet(cc_new_set);
            if (!setIncluded) {
                console.log('> DIFFERING VALSETS DETECTED!')
                console.log('CC set ' + cc_new_set.sha256hash + ' not found in historic valsets of PC!')
                console.log('PC height: ' + provider.last_height);
                console.log('CC height: ' + cc_new_set.height);
                console.log('dumping CONSUMER valset...');
                console.log(JSON.stringify(cc_new_set.valset));
                // sync dump CC valset update and PC last 1000 valsets to files
                let cc_file = './export/' + consumer.id + '_valset_' + cc_new_set.height + '.csv'
                let pc_file = './export/' + provider.id + '_valsets_' + provider.last_height + '.csv'
                console.log('saving ' + cc_file);
                new ObjectsToCsv(consumer.valsets).toDisk(cc_file);
                console.log('saving ' + pc_file);
                new ObjectsToCsv(provider.valsets).toDisk(pc_file);
            }
        }
    }
    return;
}

// fetch all historic valsets of PC
async function fetchHistoricValsets() {
    console.log("fetching historic valsets...")
    let block = 1;
    try {
        var res = await axios.get(provider.lcd + '/validatorsets/latest');
    }
    catch (e) {
        console.log(e);
        return false;
    }
    let last_block = res.data.result.block_height;
    while (block <= last_block) {
        try {
            var res = await axios.get(provider.lcd + '/validatorsets/' + block);
        }
        catch (e) {
            console.log(e);
            return false;
        }
        let valset = res.data.result.validators;
        let valset_export = [];
        valset.forEach((validator) => {
            valset_export.push(validator.address, validator.voting_power);
        });
        let valset_hash = hash(valset_export.toString());
        if (block == last_block) {
            try {
                var res = await axios.get(provider.lcd + '/validatorsets/latest');
            }
            catch (e) {
                console.log(e);
                return false;
            }
            last_block = res.data.result.block_height;
        }
        provider.valset_hashes.push(valset_hash);
        console.log("fetched PC block " + block);
        block++;
    }
    return;
}

async function main() {
    await fetchHistoricValsets();
    setInterval(fetchChains, 1000);
    fetchChains();
    return;
}

main();