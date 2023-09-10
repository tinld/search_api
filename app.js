const express = require('express')
const bodyParser = require("body-parser");
const cors = require('cors');
const neo4j = require('neo4j-driver');
//---------------------------> Express <-----------------------//
const app = express();
require("dotenv").config();
app.use(bodyParser.json({ limit: "30mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "30mb" }));
app.use("/", cors());
app.use((req, res, next) => {
  res.setHeader(
    "Access-Control-Allow-Origin",
    "*"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization "
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATH, DELETE, PUT");
  res.setHeader("Access-Control-Allow-Credenttials", true);
  next();
});


var request = require('request');

app.post('/' , (req , res)=>{
    request.post(
        'https://label-text.onrender.com',
        {json: {Text: req.body.Text}},
        function (error, response, body) {
            if (!error && response.statusCode == 200) {
                const uri = "neo4j+s://92e276c3.databases.neo4j.io:7687";
                const user = 'neo4j';
                const password = 'rctIYa-H2IgWjIphZ1Et0iEiCyuxxXra2pDVd46iQeE';
    
                const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));
    
                // Define your Cypher query
                const cypherQuery = `
                MATCH (n:Destination)-[:ON]->(m:Location {Name: '${body.result[0][0]}'})
                RETURN n, m
                LIMIT 5`;
    
                // Create a Neo4j session
                const session = driver.session();
    
                // Run the query
                session
                .run(cypherQuery)
                .then((result) => {
                    let locations = []
                    result.records.forEach((record) => {
                        locations.push(record.get('n')['properties']['Name'])
                    })
                    res.json({locations: locations});
                })
                .catch((error) => {
                    console.error('Error executing Cypher query:', error);
                })
                .finally(() => {
                    // Close the session and driver when done
                    session.close();
                    driver.close();
                });
            }
        }
    );
})

//---------------------------> Set up PORT <-------------------------//
let port = process.env.PORT;
if (port == null || port == "") {
  port = 3001;
}

//---------------------------> ListenPort <--------------------------//
app.listen(port, () => {
  console.log("Server is running on port 3001");
});