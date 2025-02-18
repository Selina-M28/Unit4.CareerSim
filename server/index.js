require("dotenv").config
const { client, createTables } = require ("./db");

const init = async () => {
    try {
        console.log("connecting to client");

        
    } catch (err) {
        console.log(err);
    }
};

init();