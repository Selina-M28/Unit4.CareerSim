require("dotenv").config

const { client, fetchItems, fetchItemsbyId, createReview, authenticate, isLoggedIn, deleteReview, fetchAllReviewsbyItem, fetchSingleReviewbyItem, deleteComment } = require ("./db");
const express = require("express");
const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());

app.post('/api/auth/login', async(req, res, next)=> {
    try {
        const { username, password } = req.body;
      res.send(await authenticate({username, password}));
    }
    catch(ex){
      next(ex);
    }
  });


app.get('/api/auth/me', isLoggedIn, async(req, res, next)=> {
    try {
      res.send(await findUserByToken(req.headers.authorization));
    }
    catch(ex){
      next(ex);
    }
  });

app.get("/api/items", async (req,res, next) => {
    try {
        const items = await fetchItems();
        res.send(items);
    }catch (err) {
        next(err);
    }
})

app.get("/api/items/:itemsid", async (req,res, next) => {
    try {
        const result = await fetchItemsbyId(req.params.itemsid);
        res.send(result);
    }catch (err) {
        next(err);
    }
})

app.get("/api/items/:itemsid/reviews", async (req,res, next) => {
    try {
        const result = await fetchAllReviewsbyItem(req.params.itemsid);
        res.send(result);
    }catch (err) {
        next(err);
    }
})

app.get("/api/items/:itemsid/reviews/:reviewsid", async (req,res, next) => {
    try {
        const result = await fetchSingleReviewbyItem(req.params.reviewsid);
        res.send(result);
    }catch (err) {
        next(err);
    }
})

app.post("/api/items/:itemsId/review", isLoggedIn, async (req,res,next) => {
    try{
        const { review_text,ranking } = req.body;
        const userId = req.user.id;
        const itemId = req.params.itemsId;

        const result = await createReview({
            userId, 
            itemId,
            review_text,
            ranking
        });
            console.log("new review");
            res.status(201).send(result);
    } catch(err) {
        next(err);
    }
})

app.delete('/api/users/:userId/reviews/:reviewId', isLoggedIn, async(req, res, next)=> {
    try {
      await deleteReview({ user_id: req.params.userId, id: req.params.id });
      res.sendStatus(204);
    }
    catch(ex){
      next(ex);
    }
  });

  app.delete('/api/users/:userId/comments/:commentId', isLoggedIn, 
    async(req, res, next)=> {
    try {
      await deleteComment({ user_id: req.params.userId, id: req.params.id });
      res.sendStatus(204);
    }
    catch(ex){
      next(ex);
    }
  });

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