
// import { toHex } from "@cosmjs/encoding";

// import { createRequire } from "module";
// const require = createRequire(import.meta.url);
// const { Tx } = require('cosmjs-types/cosmos/tx/v1beta1/tx');
// const { MsgUpdateClient } = require('cosmjs-types/ibc/core/client/v1/tx');
// const { Header } = require('cosmjs-types/ibc/lightclients/tendermint/v1/tendermint');
// const { ValidatorSetChangePacketData } = require('./client/src/types/generated/cosmos/interchain-security/proto/interchain-security/ccv/v1/ccv.ts');

/* -------------------------------------------------
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
                // 07-tendermint-0 is the CCV client for provider-chain
                if (msg.value.clientId == '07-tendermint-0') {
                    msg.value.header = Header.decode(msg.value.header.value);
                    let ibcClientUpdate = msg;
                    results.push({ "auth_info": authInfo, "client_update_data": ibcClientUpdate });
                }
            }
        });
    });
    return results;
}
------------------------------------------------- */
/* -------------------------------------------------
// parse IBC client updates
if (chain.id == consumer.id) {
    ibc_updates = parseIbcTxs(block);
    if (ibc_updates.length > 0) {
        let effected_update = ibc_updates[0];
        let trusted_valset = effected_update.client_update_data.value.header.trustedValidators.validators;
        trusted_valset.forEach((validator) => {
            validator.address = toHex(validator.address).toUpperCase()
            validator.voting_power = validator.votingPower.low
        });
        let complete_set = parseCompleteSet(trusted_valset, block);
        let comment = "IBC_CLIENT_UPDATE:PCPROPOSER/" + toHex(effected_update.client_update_data.value.header.trustedValidators.proposer.address).toUpperCase();
        let inconsistent = false

        // check if IBC valset has been a historic valset of provider
        let received_in_height = receivedInHeight(provider, complete_set);
        if (!received_in_height) {
            inconsistent = true
            comment = "INCONSISTENT_IBC_CLIENT_UPDATE:PCPROPOSER/" + toHex(effected_update.client_update_data.value.header.trustedValidators.proposer.address).toUpperCase();
        }

        appendSet(chain, complete_set, comment);
        if (inconsistent) {
            alertAndDumpSet(complete_set, comment);
        }
    }
}
------------------------------------------------- */