import * as z from "zod"


export const loginUserSchema = z.object({
    email :z.email().min(1,"Email is required"),
    password : z.string().min(8,"Pasword length : minimul 8 is required"), 
})

export type LoginBody = z.infer <typeof loginUserSchema>;