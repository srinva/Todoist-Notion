require('dotenv').config();
const { Client } = require("@notionhq/client")
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const https = require('https')
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

async function updateNotion(name, label) {
  const response = await notion.pages.create({
    parent: {
      database_id: process.env.NOTION_DB_ID,
    },
    properties: {
      "Name": [ { "text": {"content" : name} } ],
      "Tags": [ { "name": label } ],
      //"Finished": { "checkbox": true }
  }})
  .then(data => console.log(data))
  .catch(err => {
    console.log("Tag doesn't exist.");
  });
  //console.log(response);

}

function createTodoistTask(name, due, priority) {
  const data = JSON.stringify({
    "content": name,
    "due_string": due,
    "due_lang": "en",
    "priority": priority,
    "project_id": parseInt(process.env.TODOIST_PROJ_ID)
  })

  const options = {
    hostname: 'api.todoist.com',
    path: '/rest/v1/tasks',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.TODOIST_TOKEN}`
    }
  }

  const req = https.request(options, res => {
    console.log(`statusCode: ${res.statusCode}`)

    res.on('data', d => {
      process.stdout.write(d)
    })
  })

  req.on('error', error => {
    console.error(error)
  })

  req.write(data)
  req.end()
}
createTodoistTask("Node test", "today", 2)

//updateNotion("Test check", "2")


app.post('/todoist', (req, res) => {
  console.log(req.body)
  if (req.body.event_name == "item:added") {
    updateNotion(req.body.event_data.content, "2")
  }
  res.status(200).send({status: 200});
})

app.post('/github', (req, res) => {
  console.log(req.body.action)
  console.log(req.body.label)
  console.log(req.headers)
  if (req.headers['x-github-event'] = 'issues') {
    if (req.body.action = 'opened') {
      if (req.body.label != undefined) {
      updateNotion(req.body.issue.title, req.body.label.name)
      } else {

      }
    }
  }
  res.status(200).send({status: 200});
})

app.listen(3000);
