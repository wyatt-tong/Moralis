const query = async (address) => {
    const Moralis = require("moralis/node");
    const serverUrl = "https://3icohbegrdwa.usemoralis.com:2053/server";
    const appId = "uGr4RovwORtaAWsE7ELiBFYBHE0dg7Y2WeXA2yih";
    const masterKey = "UlW4C16Rv6Gz2yWZRUeV6cru0iXQKbqvtJCAAsaZ";
    const fs = require('fs');
    const addr = address.toLowerCase();
    var json = '[';

    /***  Initialize Moralis ***/
    // await Moralis.settings.setAPIRateLimit({
    //     anonymous:1000, authenticated:2000, windowMs:60000
    //   });
    await Moralis.start({ serverUrl, appId, masterKey });



    /*** Run the clound function to watch the address. This will sync the historical transaction data to database. ***/
    await Moralis.Cloud.run(
        "watchEthAddress",
        { address: address,
        sync_historical: true},
        { useMasterKey: true }
    ).then((result) => {
        console.log(result);
    });
   // const EthTransactions = Moralis.Object.extend("EthTransactions");

    /*** Create a query to get the trasaction data related to the given address. ***/
    const query_from = new Moralis.Query("EthTransactions");
    query_from.equalTo("from_address", addr);
    const query_to = new Moralis.Query("EthTransactions");
    query_to.equalTo("to_address", addr);
    const mainQuery = Moralis.Query.or(query_from, query_to);
    const results = await mainQuery.find();

    console.log("Successfully retrieved " + results.length + " EthTransactions.");
    
    
    for (let i = 0; i < results.length; i++) {
        const object = results[i];

        let block = object.get("block_number");
        /*** Convert the data to JSON. ***/
        json += JSON.stringify(object);
        if (i != results.length - 1){
            json += ',\n';
        }
    }
    json += ']'

    /*** Write the JSON to a file ***/
    fs.writeFile(addr + ".json", json, 'utf8', function (err) {
        if (err) {
            console.log("An error occured while writing JSON Object to File.");
            return console.log(err);
        }
    
        console.log("JSON file has been saved.");
    });

}

/*** Start Python program to parse the JSON and convert it to csv file. ***/
function execute(cmd){
    var exec = require('child_process').exec;
    exec(cmd, function(error, stdout, stderr){
        if(error){
            console.error(error);
        }
        else{
            console.log("success " + cmd);
        }
    });
   
 }

 /*** Get query results and generate csv file. ***/
const convert = async (address) => {
    await query(address.toLowerCase());
    const fs = require('fs');
    const csv_file = address.toLowerCase() + ".csv";
    execute("python3 convert.py" + " " + address.toLowerCase());
}


module.exports = {
    convert
}

// convert("0xad1d9d536d2ec0da134cd6eba570b62c734ea2ed");
