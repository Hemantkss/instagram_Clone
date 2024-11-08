import { User } from "../models/userModel.js";
import bcrpyt from "bcryptjs";
import jwt from "jsonwebtoken";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";
import { Post } from "../models/postModel.js";

// register
export const register = async (req, res) => {
  try {
    // register
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(401).json({
        message: "All fields are required",
        success: false,
      });
    }
    // Check
    const user = await User.findOne({ email });
    if (user) {
      return res
        .status(409)
        .json({ message: "Email already exists", success: false });
    }
    // hashed password
    const hashedPassword = await bcrpyt.hash(password, 10);
    // create new user
    await User.create({
      username,
      email,
      password: hashedPassword,
    });
    // message to saved
    return res.json({ message: "User registered successfully", success: true });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server Error", success: false });
  }
};

// login user
export const login = async (req, res) => {
  try {
    // login user
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(401)
        .json({ message: "All fields are required", success: false });
    }
    // find user by email
    let user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ message: "Incorrect email ", success: false });
    }
    // password matche
    const isPassworsMatch = await bcrpyt.compare(password, user.password);
    if (!isPassworsMatch) {
      return res.status(401).json({
        message: "Incorrect password",
        success: false,
      });
    }
    // generate token
    const token = await jwt.sign({ userId: user._id }, process.env.SECRET_KEY, {
      expiresIn: "1d",
    });

    // populate each post if in the posts array
    const populatedPosts = await Promise.all(
      user.posts.map(async (postId) => {
        const post = await Post.findById(postId);
        if (post.author.equals(user._id)) {
          return post;
        }
        return null;
      })
    );

    user = {
      _id: user._id,
      username: user.username,
      email: user.email,
      profilePicture: user.profilePicture,
      bio: user.bio,
      followers: user.followers,
      following: user.following,
      posts: populatedPosts,
    };

    return res
      .cookie("token", token, {
        httpOnly: true,
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .json({
        message: "User logged in successfully",
        success: true,
        user,
        token: token,
      });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server Error", success: false });
  }
};

//logout
export const logout = async (_, res) => {
  try {
    return res.cookie("token", "", { maxAge: 0 }).json({
      message: "Logged out successfully.",
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};

// getProfile user
export const getProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    let user = await User.findById(userId)
      .populate({ path: "posts", createdAt: -1 })
      .populate("bookmarks");
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found", success: false });
    }
    return res.status(200).json({
      user,
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server Error", success: false });
  }
};

//editProfile user
export const editProfile = async (req, res) => {
  try {
    const userId = req.id;
    const { bio, gender } = req.body;
    const profilePicture = req.file;

    let cloudResponse;
    if (profilePicture) {
      const fileUri = getDataUri(profilePicture);
      cloudResponse = await cloudinary.uploader.upload(fileUri);
    }
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found", success: false });
    }
    if (bio) user.bio = bio;
    if (gender) user.gender = gender;
    if (profilePicture) user.profilePicture = cloudResponse.secure_url;

    await user.save();
    return res.status(200).json({
      message: "Profile updated successfully",
      success: true,
      user,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server Error", success: false });
  }
};

// getSuggestedUser
export const getSuggestedUsers = async (req, res) => {
  try {
    const suggestedUsers = await User.find({ _id: { $ne: req.id } }).select(
      "-password"
    );
    if (!suggestedUsers) {
      return res
        .status(404)
        .json({ message: "No users found", success: false });
    }
    return res.status(200).json({
      success: true,
      users: suggestedUsers,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server Error", success: false });
  }
};

// followUser or UnfollowUser
export const followOrUnfollow = async (req, res) => {
  try {
    const followKrneWala = req.id; // hemant
    const jiskoFollowKrunga = req.params.id; // neha
    if (followKrneWala === jiskoFollowKrunga) {
      return res.status(400).json({
        message: "You cannot follow/unfollow yourself",
        success: false,
      });
    }

    const user = await User.findById(followKrneWala);
    const targetUser = await User.findById(jiskoFollowKrunga);

    if (!user || !targetUser) {
      return res.status(400).json({
        message: "User not found",
        success: false,
      });
    }

    const isFollowing = user.following.includes(jiskoFollowKrunga);
    if (isFollowing) {
      // unfollow logic
      await Promise.all([
        User.updateOne(
          { _id: followKrneWala },
          { $pull: { following: jiskoFollowKrunga } }
        ),
        User.updateOne(
          { _id: jiskoFollowKrunga },
          { $pull: { followers: followKrneWala } }
        ),
      ]);
      return res
        .status(200)
        .json({ message: "Unfollowed successfully", success: true });
    } else {
      // follow logic
      await Promise.all([
        User.updateOne(
          { _id: followKrneWala },
          { $push: { following: jiskoFollowKrunga } }
        ),
        User.updateOne(
          { _id: jiskoFollowKrunga },
          { $push: { followers: followKrneWala } }
        ),
      ]);
      return res
        .status(200)
        .json({ message: "Followed successfully", success: true });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server Error", success: false });
  }
};
