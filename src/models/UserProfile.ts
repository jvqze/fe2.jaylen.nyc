import { model, models, Schema } from "mongoose";

const uploadSchema = new Schema({
    audioLink: { type: String, required: true },
    title: { type: String },
    private: { type: Boolean },
    createdAt: { type: Date, default: Date.now },
});

const badgeSchema = new Schema({
    name: { type: String, required: true },
    description: { type: String },
    icon: { type: String, required: true },
    type: { type: String, required: true },
    awardedAt: { type: Date, default: Date.now },
});

const userProfileSchema = new Schema({
    username: { type: String, required: false, default: null },
    userID: { type: String, required: true },
    discordAvatar: { type: String, required: true },
    uploads: { type: [uploadSchema], required: false, default: [] },
    badges: { type: [badgeSchema], required: false, default: [] },
    createdAt: { type: Date, default: Date.now },
});

const userProfileModel = models.userProfile || model("userProfile", userProfileSchema);
export default userProfileModel;
