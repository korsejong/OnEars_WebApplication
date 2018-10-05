const db = require('./config/database');

exports.handler = async (event) => {
    let url = event.url
    let doc = {};
    let audio;
    await db.sequelize.sync();
    try{
        doc = await db.Document.findOne({where: {document_url: url}});
        if(doc == null) return null;
        audio = await doc.getAudio();
        return {document:doc,audio:audio};
    } catch (err) {
        throw new Error(err);
    }
}