const db = require('./config/database');

exports.handler = async (event) => {
    await db.sequelize.sync();
    try{
        let user = await db.User.findById(event.userId);
        let audio = await db.Audio.findById(event.audioId);
        let doc = await db.Document.create({
            document_url: event.document.url,
            main_category: event.document.mainCategory,
            sub_category: event.document.subCategory,
            title: event.document.title,
            text: event.document.summary,
            en_summary: event.document.en_summary,
            kor_summar: event.document.kor_summary,
        });
        await doc.setAudio(audio);
        await user.addDocument(doc);
        return doc;
    } catch (err) {
        throw new Error(err);
    }
}