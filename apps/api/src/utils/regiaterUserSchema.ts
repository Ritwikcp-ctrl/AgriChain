import * as z from "zod";

export const userRegisterSchema = z.object({
    email:z.email(),
    password : z.string().min(8,'Password must be at least 8 characters'),
   
    username : z.string(),
    fullName :z.string(),
    role: z.enum(["farmer","buyer","cold_storage","transporter",]),
});

export type RegisterBody = z.infer<typeof userRegisterSchema>;