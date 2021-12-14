console.log('Loading function');
        
const aws = require('aws-sdk');

const s3 = new aws.S3({ apiVersion: '2006-03-01' });

exports.CsvHandler = async (event, context) => {
   

    const bucket = event.Records[0].s3.bucket.name;
 
    const key = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));
    const params = {
        Bucket: bucket,
        Key: key,
    }; 

    
    try {
        const data = await s3.getObject(params).promise();
      
        
        const ArrayWithCsvRows = data.Body.toString('utf-8').split('\n')
        
        let outputScvArrayFirstColumn = '';
        let outputScvArraySecondColumn = '';
        
        for(const row of ArrayWithCsvRows) {
        const [col1, col2] = row.split(", ")
        outputScvArrayFirstColumn += `${col1}\n`;
        outputScvArraySecondColumn += `${col2}\n`
        }
        
        
        const [fileName] = key.split('.')
        
        const uploadParams1 = {
            Bucket: process.env.DESTINATION_BUCKETNAME,
            Key: `${fileName}-1.csv`,
            Body: Buffer.from(outputScvArrayFirstColumn)
        }
        
        const uploadParams2 = {
            Bucket: process.env.DESTINATION_BUCKETNAME,
            Key: `${fileName}-2.csv`,
            Body: Buffer.from(outputScvArraySecondColumn)
        }
        
        await Promise.all([
            s3.upload(uploadParams1).promise(),
            s3.upload(uploadParams2).promise()
        ])
         
        
        console.log('Done Uploading CSV File')
        return 'Upload Successful'
    } catch (err) {
        console.log(err);
        const message = `Error getting object ${key} from bucket ${bucket}. Make sure they exist and your bucket is in the same region as this function.`;
        console.log(message);
        throw new Error(message);
    }
};
     