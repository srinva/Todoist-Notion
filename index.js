require('dotenv').config();
const { Client } = require("@notionhq/client")
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
var cors = require('cors')


app.use(
  express.urlencoded({
    extended: true
  })
)

app.use(cors())
//Need to change, deprecated
app.use(bodyParser.json())

// Initializing a client
const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

function updateNotion(name) {
(async () => {
  const response = await notion.pages.create({
    parent: {
      database_id: process.env.NOTION_DB_ID,
    },
    properties: {
      "Name": [ { "text": {"content" : name} } ],
      "Tags": [ { "name": "2" } ],
      //"Finished": [ { "checkbox": "false" } ]
  }})
  .then(data => console.log(data))
  .catch(err => {
    console.log("Tag doesn't exist.");
  });
  //console.log(response);
})();
}

app.post('/todoist', (req, res) => {
  console.log(req.body)
  console.log(req.headers['content-type'])
  if (req.body.event_name == "item:added") {
    updateNotion(req.body.event_data.content)
  }
  res.status(200).send({status: 200});
})

app.listen(3000);
