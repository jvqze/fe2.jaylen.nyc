import { model, models, Schema } from "mongoose";

const uploadSchema = new Schema({
    audioLink: { type: String, required: true },
    title: { type: String },
    createdAt: { type: Date, default: Date.now },
});

const userProfileSchema = new Schema({
    userID: { type: String, required: true },
    discordAvatar: { type: String, required: true },
    uploads: { type: [uploadSchema], required: false, default: [] },
    createdAt: { type: Date, default: Date.now },
});

const userProfileModel = models.userProfile || model("userProfile", userProfileSchema);
export default userProfileModel;