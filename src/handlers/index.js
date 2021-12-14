console.log('Loading function');
        
const aws = require('aws-sdk');

const s3 = new aws.S3({ apiVersion: '2006-03-01' });

exports.CsvHandler = async (event, context) => {
    //console.log('Received event:', JSON.stringify(event, null, 2));

    // Get the object from the event and show its content type
    
    console.log('log_________________');
    console.log(event.Records[0].s3.object.key);
     
    const bucket = event.Records[0].s3.bucket.name;
    console.log(bucket);
    const key = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));
    const params = {
        Bucket: bucket,
        Key: key,
    }; 

    
    try {
        const stream = await s3.getObject(params).createReadStream();
        const uploadParams = {
            Bucket: process.env.DESTINATION_BUCKETNAME,
            Key: key,
            Body: stream
        }
        await s3.upload(uploadParams).promise()
        console.log('Done Uploading CSV File')
        return 'Upload Successful'
    } catch (err) {
        console.log(err);
        const message = `Error getting object ${key} from bucket ${bucket}. Make sure they exist and your bucket is in the same region as this function.`;
        console.log(message);
        throw new Error(message);
    }
};
     