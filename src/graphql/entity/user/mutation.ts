import { nanoid } from 'nanoid';

import type { User, UserInput } from '../../../interfaces/user';

import env from '../../../libs/env';
import { generateMetadataSortKey } from '../../../libs/helpers';

export default {
  Mutation: {
    createUser: async (parent, args, { dynamodb }, info) => {
      const { name, title }: UserInput = args.data;

      const user: User = {
        userID: nanoid(),
        name,
        title,
      };

      const params = {
        TableName: env.DYNAMODB_TABLE_NAME,
        Item: {
          pk: env.TODO_APP_PK,
          sk: generateMetadataSortKey(user.userID),
          name: user.name,
          title: user.title,
        },
        ConditionExpression:
          'attribute_not_exists(pk) AND attribute_not_exists(sk)',
      };

      try {
        const res = await dynamodb.put(params).promise();
        return user;
      } catch (err) {
        throw err;
      }
    },
  },
};
