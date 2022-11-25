# compare-valsets

## install

- configure via `provider` and `consumer` objects in [compare-valsets.js](./compare-valsets.js)
- to install dependencies: `npm install`
- to run script: `npm run start`

## Tracing and comparing ICS28 valsets

Documentation related to [GOC Task 9 & 10](https://github.com/hyphacoop/ics-testnets/tree/main/game-of-chains-2022#validator-sets-monitoring)

script features:
- compare (sha256 hash) every `validator set` of `consumer` against ALL historic `validator set`s of `provider`
- record every `validator set` on `provider` and `consumer` in a .csv file for visualisation
- alert and dump `validator set` states when checks are inconsistant (validator set of `consumer` is not the last or any historic validator set of `provider`)

#### recorded and published evidence for multiple inconsistent valsets on GOC consumer-chain `sputnik`

- we have observed inconsistent validator sets on `sputnik`.  
- the genesis `validator set` was consistent (reflected on `provider` in block `51925`).  
- every `validator set` update between blocks `214` and `11457` (last inconsistent `validator set` update) has not been a historic set of `provider`.  

We observed a total of `172` faulty `VSC` updates  

_all 172 faulty sets observed on `sputnik` are uploaded [here](./inconsistent-valsets/sputnik)_  

---

#### Interactive valset visualisation charts on datawrapper:  
`provider`: https://datawrapper.dwcdn.net/Cq4dt/4/  
`sputnik`: https://datawrapper.dwcdn.net/93hwB/1/  
`apollo`: https://datawrapper.dwcdn.net/UyhCP/2/  
`hero-1`: https://datawrapper.dwcdn.net/o8wc6/2/

--