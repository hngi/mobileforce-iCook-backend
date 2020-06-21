const AWS = require('aws-sdk')
const path = require('path')
const uuid = require("uuid")
const s3 = new AWS.S3({
    accessKeyId: process.env.AKIAZXTF3HPBUHHPX577,
    secretAccessKey:process.env.AWS_SECRET_ACCESS_KEY
})


module.exports = (file) => {
    if (file.size > 512,000){
        throw "One of your images is greater than 500kb"
    }
    let location = "";
    const params = {
        ACL: "public-read",
        Bucket: "ichop-mobileforce",
        Key: uuid.v4().toString() + path.extname(file.originalname),
        Body: file.buffer,
        ContentLength: file.size
    }
    
    s3.upload(params, (err, data) => {
        if (err){
            throw err;
        }
        console.log("file uploaded")
        location = data.Location         
    })

    return location 

     
}