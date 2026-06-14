import { Router, type IRouter } from "express";
import healthRouter from "./health";
import recordingsRouter from "./recordings";
import presetsRouter from "./presets";

const router: IRouter = Router();

router.use(healthRouter);
router.use(recordingsRouter);
router.use(presetsRouter);

export default router;
