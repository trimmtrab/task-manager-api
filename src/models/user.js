const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const validator = require("validator");
const Task = require("./task");

const userSchema = new mongoose.Schema(
  {
    name: {
      required: true,
      trim: true,
      type: String,
    },
    email: {
      lowercase: true,
      required: true,
      trim: true,
      type: String,
      unique: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Email is invalid");
        }
      },
    },
    age: {
      default: 0,
      type: Number,
      validate(value) {
        if (value < 0) {
          throw new Error("Age must be a positive number");
        }
      },
    },
    password: {
      minlength: 7,
      required: true,
      type: String,
      trim: true,
      validate(value) {
        if (value.toLowerCase().includes("password")) {
          throw new Error("Are you serious? Password cannot contain password");
        }
      },
    },
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
    avatar: {
      type: Buffer,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.virtual("tasks", {
  ref: "Task",
  localField: "_id",
  foreignField: "owner",
});

userSchema.methods.generateAuthToken = async function () {
  const user = this;
  const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);

  user.tokens = [...user.tokens, { token }];
  await user.save();

  return token;
};

userSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();

  delete userObject.password;
  delete userObject.tokens;
  delete userObject.avatar;
  console.log("userObject", userObject);

  return userObject;
};

userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error("Unable to login");
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error("Unable to login");
  }

  return user;
};

// Delete user tasks when user is removed
userSchema.pre("remove", async function (next) {
  const user = this;

  await Task.deleteMany({ owner: user._id });

  next();
});

// Hash the plain text password before saving
userSchema.pre("save", async function (next) {
  const user = this;

  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }

  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
