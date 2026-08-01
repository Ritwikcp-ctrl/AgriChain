import mongoose, { Schema,Document } from "mongoose";
import * as jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config({ path: "../.env" });


export interface IUser extends Document {
  username: string;
  email: string;
  fullName: string;
  password: string;
  walletAdress: string;
  nonce?: string;
  isWalletVarified: boolean;
  role: "user" | "merchant" | "farmer";
  profileImage?: string;
  bio?: string;
  refreshToken?: string;

  isPasswordCorrect(password: string): Promise<boolean>;
  generateAccessToken(): string;
  generateRefreshToken(): string;
}


const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    fullName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    password: {
      type: String,
      required: [true, "Password is required"],
    },

    walletAdress: {
      type: String,
      required: [true, "WalletAddress is required for wallet connection"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    nonce: {
      type: String,
    },

    isWalletVarified: {
      type: Boolean,
      default: false,
    },

    role: {
      type: String,
      enum: ["merchant", "farmer"],
      default: "user",
    },

    profileImage: {
      type: String,
    },

    bio: {
      type: String,
    },

    refreshToken : {
      type : String,
    }

    
  },
  { timestamps: true }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.isPasswordCorrect = async function (password: any) {
  await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  const secret = process.env.ACCESS_TOKEN_SECRET as string;
  if (!secret) {
    throw new Error("JWT_SECRET is not defined");
  }
  //The error is a function can have multiple valid signature.Typescript checks which version  you call matches.
   return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      password: this.password,
    },
    secret,
    // { expiresIn: process.env.SECRTE_TOKEN_EXPIRY as string }//The error is here Type "string" not assignable to type "number | stringValue|undefined"
    //what i have assigned is string but the jwt.sign() expects number | stringValue , where stringValue is a specific string format such as "1d","2h", "30m" and so on,TypeScript cannot guarantee that every string is one of those valid formats.
    {
      expiresIn: process.env
        .ACCESS_TOKEN_EXPIRY as jwt.SignOptions["expiresIn"],
    }
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET!,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY as jwt.SignOptions['expiresIn'],
    }
  );
};

export const User = mongoose.model<IUser>("User", userSchema);
