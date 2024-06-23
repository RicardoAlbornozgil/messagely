// routes/messages.js
const { ensureLoggedIn } = require("../middleware/auth");
const ExpressError = require("../expressError");
const Router = require("express").Router;
const { Messages } = require("../models/message")
const router = new Router();

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

    const message = Messages.get(messageId);

    // Check if the currently logged-in user is either the sender or the recipient
    if (req.user.username !== message.from_username && req.user.username !== message.to_username) {
      throw new ExpressError("Unauthorized", 401);
    }


    return message;
   
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

    const message = await Messages.create({from_username, to_username, body});

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
    const message = await Messages.get(messageId);


    // Check if the currently logged-in user is the recipient
    if (req.user.username !== message.to_user) {
      throw new ExpressError("Unauthorized", 401);
    }

    const updatedMessage = await Messages.markRead(messageId);

    return res.json({ message: updatedMessage });
    
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
