const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
// Load User model
const User = require("../models/user");
// Load input validation
const SignupValidation = require("../validator/SignupValidation");
const SigninValidation = require("../validator/SigninValidation");

module.exports = {
  //  --------------------------------------- //signup method to add a new user//--------------------------- //
  signup: async (req, res) => {
    const { firstname, lastname, email, password } = req.body;
    const { errors, isValid } = SignupValidation(req.body);

    try {
      if (!isValid) {
        res.status(404).json(errors);
      } else {
        await User.findOne({ email }).then(async (exist) => {
          if (exist) {
            errors.email = "Email already in use";
            res.status(404).json(errors);
          } else {
            const hashedpassword = bcrypt.hashSync(password, 8);
            await User.create({
              firstname,
              lastname,
              email,
              password: hashedpassword,
            });
            res.status(201).json({ message: "user added with success" });
          }
        });
      }
    } catch (error) {
      console.log(error.message);
    }
  },
  //  --------------------------------------- //signin method to add a new user//--------------------------- //

  signin: async (req, res) => {
    const { email, password } = req.body;
    const { errors, isValid } = SigninValidation(req.body);

    try {
      if (!isValid) {
        res.status(404).json(errors);
      } else {
        await User.findOne({ email }).then(async (user) => {
          if (!user) {
            errors.email =
              "Email does not exist ! please Enter the right Email or You can make account";
            res.status(404).json(errors);
          }
          // Compare sent in password with found user hashed password
          const passwordMatch = bcrypt.compareSync(password, user.password);
          if (!passwordMatch) {
            errors.password = "Wrong Password";
            res.status(404).json(errors);
          } else {
            // generate a token and send to client
            const token = jwt.sign({ _id: user._id }, "zhioua_DOING_GOOD", {
              expiresIn: "3d",
            });
            res.status(201).json({
              message: "welcom " + user.firstname + " to your home page",
              token,
              user,
            });
          }
        });
      }
    } catch (error) {
      console.log(error.message);
    }
  },
  logout: async (req, res) => {},
};
