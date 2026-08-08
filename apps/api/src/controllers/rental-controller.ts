import { NextFunction, Request,Response } from "express";
import { Rental } from "../models/rental-model";
import { Tool } from "../models/tools-model";
import ApiError from "../utils/ApiError";
import ApiResponse from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";


export const createRentalRequest = asyncHandler(async(req:Request,res:Response,next:NextFunction) =>{
    const {toolId,startDate,endDate} = req.body;

    if(!toolId || !startDate || !endDate){
        throw new ApiError(404,"all field are required")
    }

    const tool = await Tool.findById(toolId);
    if(!tool){
        throw new ApiError(404,"Tool not found")
    }
    if(!tool.availability) {
        throw new ApiError(404,"Tool is currently unavailable");
    }

    if(tool.owner.toString() === req.user?._id.toString()) {
        throw new ApiError(404,"You can not rent your own tool")
    }

    const rentalStart = new Date(startDate);
    const rentalEnd = new Date(endDate);

    if(rentalStart >= rentalEnd) {
        throw new ApiError(404,"End date must be after start date")
    }

    const millisecondsPerDay = 1000*60*60*24;

    const rentalDays = Math.ceil((rentalEnd.getTime()-rentalStart.getTime())/millisecondsPerDay);

    const totalPrice = rentalDays*tool.pricePerday;

    const rental = await Rental.create({
        tool:tool._id,
        lessor:tool.owner,
        lessee:req.user?._id,
        totalPrice,
        startDate:rentalStart,
        endDate:rentalEnd,
        status:"pending",
    })

    return res.status(200).json(new ApiResponse(200,rental,"rental request created successfully"))
}) 

