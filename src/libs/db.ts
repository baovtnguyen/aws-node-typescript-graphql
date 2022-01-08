import { DynamoDB } from 'aws-sdk';

let options = {};

if (process.env.IS_OFFLINE || process.env.NODE_ENV === 'test') {
  options = {
    region: 'localhost',
    endpoint: 'http://localhost:8000',
  };
}

export default new DynamoDB.DocumentClient(options);
