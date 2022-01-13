import type { User } from '../../../interfaces/user';

import env from '../../../libs/env';

export default {
  Query: {
    getUsers: async (parent, args, { dynamodb }, info) => {
      const params = {
        TableName: env.DYNAMODB_TABLE_NAME,
        KeyConditionExpression: `pk = :pk AND begins_with(sk, :prefix)`,
        ExpressionAttributeValues: {
          ':pk': env.TODO_APP_PK,
          ':prefix': env.PREFIX_USER_SK,
        },
      };

      try {
        const result = await dynamodb.query(params).promise();

        const users: User[] = result.Items.map((user): User => {
          return {
            userID: user.sk.split('::')[1],
            name: user.name,
            title: user.title,
          };
        });

        return users;
      } catch (err) {
        throw err;
      }
    },
  },
};
