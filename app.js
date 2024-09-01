const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const bcrypt = require("bcrypt");
const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "userData.db");

let db = null;
let dbUser = null;
const dbToServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server successfully running :http://localhost:3000/");
    });
  } catch (e) {
    console.log(`db Error :${e.message}`);
    process.exit(1);
  }
};

dbToServer();

//post
const checkTheUserName = (request) => {
  return request !== undefined;
};
const checkThePasswordLength = (request) => {
  return request.password.length < 5;
};

app.post("/register", async (request, response) => {
  const { username, name, password, gender, location } = request.body;
  const hashedPassword = await bcrypt.hash(request.body.password, 10);

  const getUser = `
    SELECT * FROM user WHERE username = '${username}';`;
  const dbResponse = await db.get(getUser);

  switch (true) {
    case checkTheUserName(dbResponse):
      response.status(400);
      response.send("User already exists");
      break;
    case checkThePasswordLength(request.body):
      response.status(400);
      response.send("Password is too short");
      break;

    default:
      const postDetails = `
            INSERT INTO user (username,name,password,gender,location) VALUES ('${username}','${name}','${hashedPassword}','${gender}','${location}');`;
      dbUser = await db.run(postDetails);
      response.status(200);
      response.send("User created successfully");
  }
});

//login user

app.post("/login", async (request, response) => {
  const { username, password } = request.body;

  const getUser = `
    SELECT * FROM user WHERE username = '${username}';`;
  const dbResponse = await db.get(getUser);

  if (dbResponse !== undefined) {
    const isTrue = await bcrypt.compare(password, dbResponse.password);
    if (isTrue === true) {
      response.status(200);
      response.send("Login success!");
    } else {
      response.status(400);
      response.send("Invalid password");
    }
  } else {
    response.status(400);
    response.send("Invalid user");
  }
});
