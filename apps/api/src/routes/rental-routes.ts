import { Router } from "express";

import { verifyJwt } from "../middlewares/verifyToken";
import {
  acceptRental,
  cancelRental,
  completeRental,
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

router.route("/:rentalId/complete").patch(verifyJwt, completeRental);

router.route("/:rentalId/cancel").patch(verifyJwt, cancelRental);

export default router;
