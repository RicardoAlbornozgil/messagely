// routes/messages.js

const express = require("express");
const { Client } = require("pg");
const { DB_URI } = require("../config");
const { ensureLoggedIn } = require("../middleware/auth");
const ExpressError = require("../expressError");

const router = express.Router();
const client = new Client({ connectionString: DB_URI });

client.connect();

/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Make sure that the currently-logged-in user is either the to or from user.
 *
 **/

router.get("/:id", ensureLoggedIn, async (req, res, next) => {
  try {
    const messageId = req.params.id;

    const messageResult = await client.query(
      `SELECT m.id,
              m.body,
              m.sent_at,
              m.read_at,
              u1.username AS from_username,
              u1.first_name AS from_first_name,
              u1.last_name AS from_last_name,
              u1.phone AS from_phone,
              u2.username AS to_username,
              u2.first_name AS to_first_name,
              u2.last_name AS to_last_name,
              u2.phone AS to_phone
       FROM messages AS m
       JOIN users AS u1 ON m.from_user = u1.username
       JOIN users AS u2 ON m.to_user = u2.username
       WHERE m.id = $1`,
      [messageId]
    );

    const message = messageResult.rows[0];

    if (!message) {
      throw new ExpressError("Message not found", 404);
    }

    // Check if the currently logged-in user is either the sender or the recipient
    if (req.user.username !== message.from_username && req.user.username !== message.to_username) {
      throw new ExpressError("Unauthorized", 401);
    }

    return res.json({
      message: {
        id: message.id,
        body: message.body,
        sent_at: message.sent_at,
        read_at: message.read_at,
        from_user: {
          username: message.from_username,
          first_name: message.from_first_name,
          last_name: message.from_last_name,
          phone: message.from_phone
        },
        to_user: {
          username: message.to_username,
          first_name: message.to_first_name,
          last_name: message.to_last_name,
          phone: message.to_phone
        }
      }
    });
  } catch (err) {
    return next(err);
  }
});

/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/

router.post("/", ensureLoggedIn, async (req, res, next) => {
  try {
    const { to_username, body } = req.body;
    const from_username = req.user.username;

    const result = await client.query(
      `INSERT INTO messages (from_user, to_user, body, sent_at) 
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
       RETURNING id, from_user AS from_username, to_user AS to_username, body, sent_at`,
      [from_username, to_username, body]
    );

    const message = result.rows[0];

    return res.status(201).json({ message });
  } catch (err) {
    return next(err);
  }
});

/** POST /:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Make sure that only the intended recipient can mark as read.
 *
 **/

router.post("/:id/read", ensureLoggedIn, async (req, res, next) => {
  try {
    const messageId = req.params.id;

    // Get the message details to ensure the current user is the recipient
    const messageResult = await client.query(
      `SELECT to_user FROM messages WHERE id = $1`,
      [messageId]
    );

    const message = messageResult.rows[0];

    if (!message) {
      throw new ExpressError("Message not found", 404);
    }

    // Check if the currently logged-in user is the recipient
    if (req.user.username !== message.to_user) {
      throw new ExpressError("Unauthorized", 401);
    }

    const result = await client.query(
      `UPDATE messages 
       SET read_at = CURRENT_TIMESTAMP 
       WHERE id = $1
       RETURNING id, read_at`,
      [messageId]
    );

    const updatedMessage = result.rows[0];

    return res.json({ message: updatedMessage });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
