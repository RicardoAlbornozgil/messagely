const express = require("express");
const { Client } = require("pg");
const { DB_URI } = require("../config");
const { ensureLoggedIn, ensureCorrectUser } = require("../middleware/auth");
const ExpressError = require("../expressError");

const router = express.Router();
const client = new Client({ connectionString: DB_URI });

client.connect();

/** GET / - get list of users.
 *
 * => {users: [{username, first_name, last_name, phone}, ...]}
 *
 **/
router.get("/", ensureLoggedIn, async (req, res, next) => {
  try {
    const result = await client.query(
      `SELECT username, first_name, last_name, phone FROM users`
    );

    return res.json({ users: result.rows });
  } catch (err) {
    return next(err);
  }
});

/** GET /:username - get detail of user.
 *
 * => {user: {username, first_name, last_name, phone, join_at, last_login_at}}
 *
 **/
router.get("/:username", ensureLoggedIn, ensureCorrectUser, async (req, res, next) => {
  try {
    const username = req.params.username;

    const result = await client.query(
      `SELECT username, first_name, last_name, phone, join_at, last_login_at
       FROM users WHERE username = $1`,
      [username]
    );

    const user = result.rows[0];

    if (!user) {
      throw new ExpressError("User not found", 404);
    }

    return res.json({ user });
  } catch (err) {
    return next(err);
  }
});

/** GET /:username/to - get messages to user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 from_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/
router.get("/:username/to", ensureLoggedIn, ensureCorrectUser, async (req, res, next) => {
  try {
    const username = req.params.username;

    const result = await client.query(
      `SELECT m.id,
              m.body,
              m.sent_at,
              m.read_at,
              u.username AS from_username,
              u.first_name AS from_first_name,
              u.last_name AS from_last_name,
              u.phone AS from_phone
       FROM messages AS m
       JOIN users AS u ON m.from_user = u.username
       WHERE m.to_user = $1`,
      [username]
    );

    return res.json({ messages: result.rows });
  } catch (err) {
    return next(err);
  }
});

/** GET /:username/from - get messages from user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 to_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/
router.get("/:username/from", ensureLoggedIn, ensureCorrectUser, async (req, res, next) => {
  try {
    const username = req.params.username;

    const result = await client.query(
      `SELECT m.id,
              m.body,
              m.sent_at,
              m.read_at,
              u.username AS to_username,
              u.first_name AS to_first_name,
              u.last_name AS to_last_name,
              u.phone AS to_phone
       FROM messages AS m
       JOIN users AS u ON m.to_user = u.username
       WHERE m.from_user = $1`,
      [username]
    );

    return res.json({ messages: result.rows });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
