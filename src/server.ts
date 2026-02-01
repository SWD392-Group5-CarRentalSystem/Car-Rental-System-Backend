import express, { Request, Response } from "express";
import cors from "cors";

const app = express();
const apiRouter = express.Router();

//middleware
app.use(cors());
app.use(express.json());

//routes


app.use("/api/v1", apiRouter);
//coonectDB

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
