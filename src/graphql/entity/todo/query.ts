import type { Todo } from '../../../interfaces/todo';
import { generateTodoSortKey } from '../../../libs/helpers';
import env from '../../../libs/env';

export default {
  Query: {
    getTodos: async (parent, args, { dynamodb }, info): Promise<Todo[]> => {
      try {
        const params = {
          TableName: env.DYNAMODB_TABLE_NAME,
          KeyConditionExpression: `#pk = :pk and begins_with(#sk, :sk)`,
          ExpressionAttributeNames:{
            "#pk": "pk",
            "#sk": 'sk'
          },
          ExpressionAttributeValues: {
            ':pk': env.TODO_APP_PK,
            ':sk': generateTodoSortKey()
          },
        };
        const result = await dynamodb.query(params).promise();

        const returnTodos = [];
        for (const todo of result.Items) {
          const [ _, returnUserID, returnTodoID ] = todo.sk.split('::');

          returnTodos.push({
            userID: returnUserID,
            todoID: returnTodoID,
            content: todo.content,
            isCompleted: todo.isCompleted,
          });
        }

        return returnTodos;

      } catch (err) {
        throw err;
      }
    },
    getTodosOfUser: async (parent, args, { dynamodb }, info): Promise<Todo[]> => {
      try {
        const { userID } = args;

        if (userID.trim().length === 0) {
          throw new Error('userID cannot be empty');
        }
        const params = {
          TableName: env.DYNAMODB_TABLE_NAME,
          KeyConditionExpression: `#pk = :pk and begins_with(#sk, :sk)`,
          ExpressionAttributeNames:{
            "#pk": "pk",
            "#sk": 'sk'
          },
          ExpressionAttributeValues: {
            ':pk': env.TODO_APP_PK,
            ':sk': generateTodoSortKey(userID)
          },
        };
        const result = await dynamodb.query(params).promise();
        const returnTodo = result.Items;

        const returnTodos = [];
        for (const todo of result.Items) {
          const [ _, returnUserID, returnTodoID ] = todo.sk.split('::');

          returnTodos.push({
            userID: returnUserID,
            todoID: returnTodoID,
            content: todo.content,
            isCompleted: todo.isCompleted,
          });
        }

        return returnTodos;

      } catch (err) {
        throw err;
      }
    },
  },
};
