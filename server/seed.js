require("dotenv").config();

const { client, createTables, createUser, createItem, createReview } = require("./db");

const seed = async () => {
  try {
    await client.connect();
    console.log("creating table");
    await createTables();
    console.log("tables created");
    const [Jane, Jackie, Amber] = await Promise.all([
      createUser("Jane", "j_pwd"),
      createUser("Jackie", "j_pwd"),
      createUser("Amber", "a_pwd"),
      createUser("Julia", "j_pw")
    ]);
    console.log("user created");
    const [Alberino, Nordstrom, Starbucks] = await Promise.all([
      createItem("Alberino", "restaurant"),
      createItem("Nordstrom", "retail store"),
      createItem("Starbucks", "cafe")
    ]);
    console.log("item created");
    client.end();
  } catch (err) {
    console.log(err);
  }
};

seed();
