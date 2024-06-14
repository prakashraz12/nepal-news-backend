import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { getAuth } from "firebase-admin/auth";
import { User } from "../models/user.model.js";
import { errorHandler } from "../utils/error-handler.util.js";
import { responseHandler } from "../utils/response-handler.util.js";
import { transporter } from "../utils/nodemailer.js";
import { uploadOnCloudinary } from "../utils/cloudinary.utils.js";

// user create
export const createNewUser = async (req, res) => {
    try {
        const { fullName, email, phone, password } = req.body;
        // Check if all required fields are provided
        if (!fullName || !email || !password) {
            return errorHandler(
                400,
                "Please fill all required fields (e.g., email, password, fullname)",
                res
            );
        }
        // Check if user already exists in the database
        const existingUser = await User.findOne({ email: email });
        // If user already exists, return error
        if (existingUser) {
            return errorHandler(
                403,
                "User already exists in the database.",
                res
            );
        }

        // Hash the password before saving user in the database
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = await User.create({
            fullName,
            email,
            password: hashedPassword,
            phone,
        });

        //verification token;
        const verificationToken = jwt.sign({ email }, process.env.JWT_SECRET, {
            expiresIn: "30m",
        });

        // Save verification token in the database
        newUser.verificationToken = verificationToken;
        await newUser.save();

        // Send verification email
        const verificationURL = `http://localhost:3000/auth/verify-email-page/${verificationToken}`;
        await transporter.sendMail({
            to: email,
            subject: "Verify Your Email Address",
            html: `Please click on this link to verify your email address: <a href="${verificationURL}">${verificationURL}</a>`,
        });

        // Return success response
        return responseHandler(201, "User created successfully", newUser, res);
    } catch (error) {
        errorHandler(500, error.message, res);
    }
};

//user login
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        //find user
        const findUser = await User.findOne({ email });
        if (!findUser) {
            return errorHandler(404, "User not found", res);
        }
        //compare password;
        const isPasswordMatched = await bcrypt.compare(
            password,
            findUser.password
        );

        //if password is not matched
        if (!isPasswordMatched) {
            return errorHandler(400, "Invalid user details", res);
        }

        //create jwtToken;
        const token = jwt.sign(
            { userId: findUser?._id, role: findUser?.userType },
            process.env.JWT_SECRET,
            {
                expiresIn: "90d",
            }
        );

        //set cookies to client user;
        res.cookie("token", token, {
            httpOnly: true,
            maxAge: 90 * 24 * 60 * 60 * 1000,
            sameSite: "none",
            secure: true,
        });

        //extract password and usertype and unneeded fields from resposne
        const formattedData = {
            fullName: findUser?.fullName,
            email: findUser?.email,
            phone: findUser?.phone,
            address: findUser?.address,
            avatar: findUser?.avatar,
            id: findUser._id,
        };

        const data = {
            token,
            user: formattedData,
        };

        return responseHandler(200, "User logedIn Successfully", data, res);
    } catch (error) {
        errorHandler(500, error.message, res);
    }
};

//forgot password
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        // Generate reset token
        const resetToken = jwt.sign({ email }, process.env.JWT_SECRET, {
            expiresIn: "10m",
        });

        const user = await User.findOneAndUpdate(
            { email },
            { resetToken, resetTokenExpires: Date.now() + 600000 }
        );

        if (!user) {
            return errorHandler(404, "User not found", res);
        }
        // Send reset password email
        const resetURL = `http://localhost:3000/auth/reset-password-page/${resetToken}`;
        await transporter.sendMail({
            to: email,
            subject: "Reset Your Password",
            html: `Please click on this link to reset your password: <a href="${resetURL}">${resetURL}</a>`,
        });

        res.status(200).json({ message: "Reset password email sent" });
    } catch (error) {
        errorHandler(500, error.message, res);
    }
};

//reset password;
export const resetPassword = async (req, res) => {
    try {
        const { token, password } = req.body;
        // Find user by reset token and ensure it's not expired
        const user = await User.findOne({
            resetToken: token,
            resetTokenExpires: { $gt: Date.now() },
        });
        if (!user) {
            return errorHandler(
                400,
                "Reset token is invalid or has expired",
                res
            );
        }
        const resposeData = {};
        // Update user's password
        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
        user.resetToken = undefined;
        user.resetTokenExpires = undefined;
        await user.save();
        return responseHandler(
            200,
            "Password reset successfully",
            resposeData,
            res
        );
    } catch (error) {
        errorHandler(500, error.message, res);
    }
};

// Email Verification;
export const verifyEmail = async (req, res) => {
    try {
        const { token } = req.params;

        if (!token) {
            return errorHandler(400, "Token is not provided", res);
        }
        //check if token is varifed or not;
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        // if (decodedToken == null) {
        // }
        // Find user by verification token
        const user = await User.findOneAndUpdate(
            { verificationToken: token },
            { $set: { isVerified: true } }
        );

        if (!user) {
            return errorHandler(400, "Verification token is invalid", res);
        }

        const responseData = {};
        return responseHandler(
            200,
            "Email verified successfully",
            responseData,
            res
        );
    } catch (error) {
        errorHandler(500, error.message, res);
    }
};

//resentToken;
export const ResendVerifyEmail = async (req, res) => {
    try {
        const { token } = req.params;

        if (!token) {
            return errorHandler(400, "Token is not provided", res);
        }

        // Find the user associated with the provided verification token
        const user = await User.findOne({ verificationToken: token });

        if (!user) {
            return errorHandler(404, "User not found", res);
        }

        //check if user already verifed or not
        if (user?.isVerified === true) {
            return errorHandler(500, "User already verified");
        }
        const newVerificationToken = await jwt.sign(
            { email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: "10m" }
        );

        // Update user's verification token and save to database
        user.verificationToken = newVerificationToken;
        await user.save();

        // Send new verification email with updated token
        const verificationURL = `http://localhost:3000/auth/verify-email-page/${newVerificationToken}`;
        await transporter.sendMail({
            to: user.email,
            subject: "Resend Verification Email",
            html: `Your verification token has expired. Please click on this link to verify your email address: <a href="${verificationURL}">${verificationURL}</a>`,
        });

        const responseData = {};
        return responseHandler(
            200,
            "Verification email resent successfully with new token",
            responseData,
            res
        );
    } catch (error) {
        errorHandler(500, error.message, res);
    }
};

// export const user logout;
export const userLogout = async (req, res) => {
    try {
        res.clearCookie("token");
        const responseData = {};
        responseHandler(200, "cookie removed succesfully", responseData, res);
    } catch (error) {
        errorHandler(500, error.message, res);
    }
};

export const updatePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;

        const user = req.user;
        if (!oldPassword || !newPassword) {
            return errorHandler(
                400,
                "old password and new password is required",
                res
            );
        }
        const findUser = await User.findById(user);
        if (!findUser) {
            return errorHandler(404, "user not found", res);
        }

        if (!findUser.password && findUser.google_auth) {
            return errorHandler(
                500,
                "you not set password yet, login with google",
                res
            );
        }

        const isOldPasswordCorrect = await bcrypt.compare(
            oldPassword,
            findUser.password
        );

        if (!isOldPasswordCorrect) {
            return errorHandler(404, "old password is incorrect", res);
        }

        const saltedPassword = await bcrypt.hash(newPassword, 10);

        findUser.password = saltedPassword;

        findUser.save();
        const response = {};
        responseHandler(200, "password updated", response, res);
    } catch (error) {
        errorHandler(500, error?.message, res);
    }
};

export const continueWithGoogle = async (req, res) => {
    try {
        const { access_token } = req.query;
        //send token to firebase that extract user deatils by token
        const data = await getAuth().verifyIdToken(access_token);
        //find user if already exists in database
        const { email, name, picture } = data;

        const findUser = await User.findOne({ email });

        //if already in databse
        if (findUser) {
            if (!findUser.google_auth) {
                return errorHandler(
                    403,
                    "This is email already exist please login with password.",
                    res
                );
            }

            const token = jwt.sign(
                { userId: findUser?._id, role: findUser?.userType },
                process.env.JWT_SECRET,
                {
                    expiresIn: "90d",
                }
            );

            //set cookies to client user;
            res.cookie("token", token, {
                httpOnly: true,
                maxAge: 90 * 24 * 60 * 60 * 1000,
                sameSite: "none",
                secure: true,
            });

            const formattedData = {
                fullName: findUser?.fullName,
                email: findUser?.email,
                phone: findUser?.phone,
                address: findUser?.address,
                avatar: findUser?.avatar,
                id: findUser._id,
            };

            const data = {
                token,
                user: formattedData,
            };

            return responseHandler(200, "User logedin Successfully", data, res);
        } else {
            const newUser = await User.create({
                fullName: name,
                email,
                avatar: picture,
                google_auth: true,
            });

            await newUser.save();
            const token = jwt.sign(
                { userId: findUser?._id, role: findUser?.userType },
                process.env.JWT_SECRET,
                {
                    expiresIn: "90d",
                }
            );

            //set cookies to client user;
            res.cookie("token", token, {
                httpOnly: true,
                maxAge: 90 * 24 * 60 * 60 * 1000,
                sameSite: "none",
                secure: true,
            });

            const formattedData = {
                fullName: newUser?.fullName,
                email: newUser?.email,
                phone: newUser?.phone,
                address: newUser?.address,
                avatar: newUser?.avatar,
                id: newUser._id,
            };

            const data = {
                token,
                user: formattedData,
            };

            return responseHandler(
                201,
                "User Register Successfully",
                data,
                res
            );
        }
    } catch (error) {
        errorHandler(500, error?.message, res);
    }
};

export const updateUser = async (req, res) => {
    const { fullName, email, phone } = req.body;
    try {
        const userId = req.user;
        const findUser = await User.findById(userId);
        if (!findUser) {
            return errorHandler(404, "user not found", res);
        }

        if (req?.file) {
            const bannerImage = req.file?.path;
            const cloudinaryUpload = await uploadOnCloudinary(bannerImage);
            findUser.avatar = cloudinaryUpload?.secure_url;
        }

        findUser.fullName = fullName;
        findUser.email = email;
        findUser.phone = phone;

        await findUser.save();
        const response = {
            fullName: findUser.fullName,
            email: findUser.email,
            phone: findUser.phone,
            avatar: findUser?.avatar,
        };
        responseHandler(200, "user's data udpated", response, res);
    } catch (error) {
        errorHandler(500, error.message, res);
    }
};
