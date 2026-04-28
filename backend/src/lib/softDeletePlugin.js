import mongoose from 'mongoose';

// Reusable Mongoose plugin that adds soft-delete behavior to a schema.
//
// Adds:
//   - deletedAt (Date, default null), deletedBy (ObjectId ref User, default null)
//   - Auto-filter on every find* query: { deletedAt: null }
//   - Auto-filter on countDocuments
//   - Instance method: doc.softDelete(userId)
//   - Query helper: Model.find(...).withDeleted() to bypass the auto-filter
//
// Aggregate pipelines are NOT auto-filtered — callers must add { $match: { deletedAt: null } }
// explicitly when needed. This is intentional: prepending $match can break pipelines that
// require specific stage ordering ($lookup, $unwind, etc.).

export default function softDeletePlugin(schema) {
    schema.add({
        deletedAt: { type: Date, default: null, index: false },
        deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    });

    // pre(/^find/) covers: find, findOne, findOneAndUpdate, findById, findByIdAndUpdate,
    // findOneAndDelete, findOneAndRemove. Standard Mongoose idiom.
    schema.pre(/^find/, function (next) {
        if (!this.getOptions().withDeleted) {
            this.where({ deletedAt: null });
        }
        next();
    });

    // countDocuments is NOT covered by the /^find/ regex above — it has its own hook stack.
    schema.pre('countDocuments', function (next) {
        if (!this.getOptions().withDeleted) {
            this.where({ deletedAt: null });
        }
        next();
    });

    schema.methods.softDelete = function (userId) {
        this.deletedAt = new Date();
        this.deletedBy = userId || null;
        return this.save();
    };

    schema.query.withDeleted = function () {
        return this.setOptions({ withDeleted: true });
    };
}
