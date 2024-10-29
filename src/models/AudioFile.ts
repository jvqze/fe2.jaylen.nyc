import mongoose, { model, models } from "mongoose";

const audioFileSchema = new mongoose.Schema({
    email: { type: String, required: true },
    audioLink: { type: String, required: true },
    title: { type: String, required: false },
    createdAt: { type: Date, default: Date.now },
});

const AudioFileModel = models.AudioFile || model("AudioFile", audioFileSchema);
export default AudioFileModel;
