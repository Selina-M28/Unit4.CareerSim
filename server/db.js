const pg = require("pg");
const uuid = require("uuid");
require("dotenv").config();

const client = new pg.Client();

const createTables = async() => {
    try {
        const SQL =` 
        DROP TABLE IF EXISTS comments;
        DROP TABLE IF EXISTS reviews;
        DROP TABLE IF EXISTS users;
        DROP TABLE IF EXISTS items;
        CREATE TABLE users (id UUID PRIMARY KEY, username VARCHAR(64) NOT NULL UNIQUE, password VARCHAR(256) NOT NULL);
        CREATE TABLE items (id UUID PRIMARY KEY, name VARCHAR(64) NOT NULL, item_type VARCHAR(64) NOT NULL );
        CREATE TABLE reviews (
        id UUID PRIMARY KEY,
        review_text VARCHAR(256),
        ranking INTEGER DEFAULT 3 NOT NULL,
        user_id UUID REFERENCES users(id) not NULL,
        item_id UUID REFERENCES items(id) NOT NULL,
        CONSTRAINT unique_review UNIQUE(user_id, item_id));
        CREATE TABLE comments (
        id UUID PRIMARY KEY, 
        comment VARCHAR(256), 
        user_id UUID REFERENCES users(id), 
        review_id UUID REFERENCES reviews(id));`;
        await client.query(SQL);
    } catch(err) { 
        console.log(err);
    }
}

const createUser = async (username,password) => {
    try {
        const SQL = ` INSERT INTO users(id, username, password) VALUES ($1,$2,$3) RETURNING *;`
        const {rows} = await client.query(SQL, [uuid.v4(), username,password]);
        return rows[0];
    } catch (err) {
        console.log(err);
    }
}

const createItem = async (name,type) => {
    try {
        const SQL = ` INSERT INTO items(id, name, item_type) VALUES ($1,$2,$3) RETURNING *;`
        const {rows} = await client.query(SQL, [uuid.v4(), name, type]);
        return rows[0];
    } catch (err) {
        console.log(err);
    }
}

const createReview = async (review) => {
    try {
        const {userId,itemId, review_text, ranking} = review
        const SQL = ` INSERT INTO reviews(id, user_id, item_id, review_text, ranking) VALUES ($1,$2,$3,$4,$5) RETURNING *;`
        const {rows} = await client.query(SQL, [uuid.v4(),userId,itemId, review_text, ranking]);
        return rows;
    } catch (err) {
        console.log(err);
    }
}

const createComment = async (comments) => {
    try {
        const {userId,reviewId, comment} = comments
        const SQL = ` INSERT INTO comments(id, user_id, review_id, comment) VALUES ($1,$2,$3,$4) RETURNING *;`
        const {rows} = await client.query(SQL, [uuid.v4(),userId,reviewId, comment]);
        return rows;
    } catch (err) {
        console.log(err);
    }
}

const fetchUsers = async () => {
    try {
        const SQL = `SELECT * FROM users;`
        const { rows } = await client.query(SQL);
        return rows;
    } catch(err) {
        console.error(err);
    }
}

const fetchItems = async () => {
    try {
        const SQL = `SELECT * FROM items;`
        const { rows } = await client.query(SQL);
        return rows;
    } catch(err) {
        console.error(err);
    }
}

const deleteReview = async (user_id, id) => {
    try {
        const SQL = `DELETE FROM reviews WHERE user_id = $1 AND id = $2;`
        await client.query(SQL, [user_id, id]);
        return true;
    } catch(err) {
        console.error(err);
    }
}

const deleteComment = async (user_id, review_id, id) => {
    try {
        const SQL = `DELETE FROM comments WHERE user_id = $1 AND review_id =$2 AND id = $3;`
        await client.query(SQL, [user_id, review_id, id]);
        return true;
    } catch(err) {
        console.error(err);
    }
}


module.exports = { 
    client,
    createTables,
    createUser,
    createItem,
    createReview,
    createComment,
    fetchUsers,
    fetchItems,
    deleteReview,
    deleteComment
    
};