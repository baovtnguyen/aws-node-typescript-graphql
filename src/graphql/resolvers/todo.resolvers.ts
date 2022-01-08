export default {
  Query: {
    hello: () => 'Hello, World!!!',
    // getTodos: async (parent, args, context) => {
    //   const { dynamodb } = context;

    //   const params = {
    //     TableName: process.env.DYNAMODB_TABLE_NAME,
    //     KeyConditionExpression: `pk = :pk`,
    //     ExpressionAttributeValues: {
    //       ':pk': process.env.TODO_APP_PK,
    //     },
    //   };

    //   const result = await dynamodb.query(params).promise();
    //   console.log(result.Items);
    //   return result.Items;
    // },
  },
};
