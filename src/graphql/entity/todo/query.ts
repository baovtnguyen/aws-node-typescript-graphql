import type { Todo } from '../../../interfaces/todo';

export default {
  Query: {
    hello: () => {
      return 'Hello, World!';
    },

    getTodos: async (parent, args, { dynamodb }, info) => {
      const params = {
        TableName: process.env.DYNAMODB_TABLE_NAME,
        KeyConditionExpression: `pk = :pk`,
        ExpressionAttributeValues: {
          ':pk': process.env.TODO_APP_PK,
        },
      };

      try {
        const result = await dynamodb.query(params).promise();
        return result.Items;
      } catch (err) {
        throw err;
      }
    },
  },
};
