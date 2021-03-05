let mongoose = require('mongoose');
let moment = require('moment');

let commentSchema = new mongoose.Schema({
    text: String,
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
    createdAt: {
        type: Date,
        default: () => moment().format('YYYY MM DD HH:mm')
    }
});

// commentSchema.pre('save', function () {
//     now = new Date();
//     this.updated_at = now;
//     if(!this.created_at) {
//         this.created_at = now
//     }
//     next();
// })

module.exports = mongoose.model('Comment', commentSchema);