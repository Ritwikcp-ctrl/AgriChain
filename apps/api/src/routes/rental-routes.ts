import { Router } from "express";

import { verifyJwt } from "../middlewares/verifyToken";
import {
  acceptRental,
  createRentalRequest,
  getAllRentalById,
  getAllRentals,
  rejectRental,
} from "../controllers/rental-controller";

const router = Router();

router.route("/createrental").post(verifyJwt, createRentalRequest);

router.route("/getrental").get(verifyJwt, getAllRentals);

router.route("/getbyId").get(verifyJwt, getAllRentalById);

router.route("/acceptrent").patch(verifyJwt, acceptRental);

router.route("/:rentalId/reject").patch(verifyJwt, rejectRental);

export default router;
