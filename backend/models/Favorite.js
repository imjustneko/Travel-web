
const favoriteSchema = new mongoose.Schema({
  user: { type: ObjectId, ref: 'User', required: true },
  item: { type: ObjectId, ref: 'Destination', required: true },
  itemType: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

favoriteSchema.index({ user: 1, item: 1 }, { unique: true });