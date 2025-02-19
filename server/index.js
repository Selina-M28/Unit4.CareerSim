require("dotenv").config;

const {
  client,
  fetchItems,
  fetchItemsbyId,
  createReview,
  createComment,
  findUserByToken,
  authenticate,
  isLoggedIn,
  register,
  fetchAllReviewsbyItem,
  fetchSingleReviewbyItem,
  updateReview,
  updateComment,
  deleteReview,
  deleteComment,
} = require("./db");
const express = require("express");
const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());

app.post("/api/auth/register", async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const token = await register({ username, password });
    res.status(201).send(token);
  } catch (ex) {
    next(ex);
  }
});

app.post("/api/auth/login", async (req, res, next) => {
  try {
    const { username, password } = req.body;
    res.send(await authenticate({ username, password }));
  } catch (ex) {
    next(ex);
  }
});

app.get("/api/auth/me", isLoggedIn, async (req, res, next) => {
  try {
    res.send(await findUserByToken(req.headers.authorization));
  } catch (ex) {
    next(ex);
  }
});

app.get("/api/items", async (req, res, next) => {
  try {
    const items = await fetchItems();
    res.send(items);
  } catch (err) {
    next(err);
  }
});

app.get("/api/items/:itemsid", async (req, res, next) => {
  try {
    const result = await fetchItemsbyId(req.params.itemsid);
    res.send(result);
  } catch (err) {
    next(err);
  }
});

app.get("/api/items/:itemsId/reviews", async (req, res, next) => {
  try {
    const result = await fetchAllReviewsbyItem(req.params.itemsid);
    res.send(result);
  } catch (err) {
    next(err);
  }
});

app.get("/api/items/:itemsid/reviews/:reviewsid", async (req, res, next) => {
  try {
    const result = await fetchSingleReviewbyItem(req.params.reviewsid);
    res.send(result);
  } catch (err) {
    next(err);
  }
});

app.post("/api/items/:itemsId/review", isLoggedIn, async (req, res, next) => {
  try {
    const { review_text, ranking } = req.body;
    const user = await findUserByToken(req.headers.authorization);
    const itemId = req.params.itemsId;

    const result = await createReview(user, { itemId, review_text, ranking});
    console.log("new review");
    res.status(201).send(result);
  } catch (err) {
    next(err);
  }
});

app.get("/api/reviews/me", isLoggedIn, async (req, res, next) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).send({ error: "Unauthorized user" });
    }

    const SQL = `SELECT * FROM reviews WHERE user_id = $1`;
    const { rows: reviews } = await client.query(SQL, [user.id]);

    res.status(200).send(reviews);
  } catch (ex) {
    next(ex);
  }
});

app.put("/api/users/:userId/reviews/:reviewId", isLoggedIn, async (req, res, next) => {
    try {
      const { userId, reviewId } = req.params;
    const { review_text, ranking } = req.body;
      const user = req.user;

      const result = await updateReview(reviewId, review_text, ranking);
      console.log("review updated!");
      res.status(200).send(result);
    } catch (err) {
      next(err);
    }
  }
);

app.post("/api/items/:itemId/reviews/:reviewId/comments", isLoggedIn, async (req, res, next) => {
  try {
    const { comment } = req.body;
    const user = await findUserByToken(req.headers.authorization);
    const {itemId, reviewId} = req.params;

    const result = await createComment(user.id,reviewId,comment);
    console.log("new comment");
    res.status(201).send(result);
  } catch (err) {
    next(err);
  }
});

app.get("/api/comments/me", isLoggedIn, async (req, res, next) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).send({ error: "Unauthorized user" });
    }

    const SQL = `SELECT * FROM comments WHERE user_id = $1`;
    const { rows: comments } = await client.query(SQL, [user.id]);

    res.status(200).send(comments);
  } catch (ex) {
    next(ex);
  }
});

app.put("/api/users/:userId/comments/:commentId", isLoggedIn, async (req, res, next) => {
  try {
    const { userId, commentId } = req.params;
  const { comment } = req.body;
    const user = req.user;

    const result = await updateComment(commentId, comment);
    console.log("Comment updated!");
    res.status(200).send(result);
  } catch (err) {
    next(err);
  }
}
);

app.delete("/api/users/:userId/reviews/:reviewId", isLoggedIn,
  async (req, res, next) => {
    try {
      const { userId, reviewId} = req.params;
      const deleted = await deleteReview(userId, reviewId);
      res.sendStatus(204);
    } catch (ex) {
      next(ex);
    }
  }
);

app.delete("/api/users/:userId/reviews/:reviewId/comments/:commentId", isLoggedIn, 
  async (req, res, next) => {
    try {
      const { userId, reviewId, commentId } = req.params;
      const deleted = await deleteComment(userId, reviewId, commentId);

      if (deleted) {
        res.sendStatus(204); 
      } else {
        res.status(404).json({ error: "Comment not found or not authorized to delete" });
      }
    } catch (ex) {
      next(ex);
    }
  }
);

const init = async () => {
  try {
    console.log("connecting to client");
    await client.connect();
    app.listen(PORT, () => {
      console.log(`server live on port ${PORT}`);
    });
  } catch (err) {
    console.log(err);
  }
};

init();
