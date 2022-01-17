import type { Todo } from '../../../interfaces/todo';

import env from '../../../libs/env';

export default {
  User: {
    todos: async (user, args, { dynamodb }, info): Promise<Todo[]> => {
      const params = {
        TableName: env.DYNAMODB_TABLE_NAME,
        KeyConditionExpression: `pk = :pk AND begins_with(sk, :prefix)`,
        ExpressionAttributeValues: {
          ':pk': env.TODO_APP_PK,
          ':prefix': `${env.PREFIX_TODO_SK}::${user.userID}`,
        },
      };

      try {
        const result = await dynamodb.query(params).promise();

        const todos: Todo[] = result.Items.map((todo): Todo => {
          const todoID = todo.sk.split('::')[2];

          return {
            userID: user.userID,
            todoID,
            content: todo.content,
            isCompleted: todo.isCompleted,
          };
        });

        return todos;
      } catch (err) {
        throw err;
      }
    },
  },
};
