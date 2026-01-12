import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";


const supervisorYearlyBudgetSchema = new Schema(
  {
    year: {
      type: Number,
      required: true,
    },

    totalAllocatedToMe: {
      type: Number,
      default: 0,
    },


  },
  { _id: false }
);




const supervisorSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      match: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
    },

    password: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      trim: true,
    },

    stationId: {
      type: Schema.Types.ObjectId,
      ref: "Station",
    },

    yearlyBudgets: [supervisorYearlyBudgetSchema],

    createdStations: [
      {
        type: Schema.Types.ObjectId,
        ref: "Station",
      },
    ],

    role: {
      type: String,
      enum: ["admin"],
      default: "admin",
    },

    refreshToken: {
      type: String,
      default: null,
    },

    accessToken: {
      type: String,
      default: null,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Encrypt password
supervisorSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// Compare password
supervisorSchema.methods.isPasswordCorrect = function (password) {
  return bcrypt.compare(password, this.password);
};

// Access Token
supervisorSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    { _id: this._id, email: this.email, role: this.role },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );
};

// Refresh Token
supervisorSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    { _id: this._id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
  );
};

export const Supervisor = mongoose.model("Supervisor", supervisorSchema);
