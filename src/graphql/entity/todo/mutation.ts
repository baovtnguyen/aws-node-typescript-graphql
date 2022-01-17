import { nanoid } from 'nanoid';
import type { Todo } from '../../../interfaces/todo';
import { generateTodoSortKey } from '../../../libs/helpers';
import env from '../../../libs/env';

export default {
  Mutation: {
    createTodo: async (parent, args, { dynamodb }, info): Promise<Todo> => {
      try {
        const { userID, content } = args;

        if (userID.trim().length === 0 || content.trim().length === 0) {
          throw new Error('userID and content cannot be empty');
        }

        const newTodo = {
          pk: env.TODO_APP_PK,
          sk: generateTodoSortKey(userID, nanoid()),
          content: content,
          isCompleted: false,
        };

        const params = {
          TableName: env.DYNAMODB_TABLE_NAME,
          Item: newTodo,
          ConditionExpression:
            'attribute_not_exists(pk) AND attribute_not_exists(sk)',
        };

        await dynamodb.put(params).promise();

        const [_, returnUserID, returnTodoID] = newTodo.sk.split('::');

        return {
          userID: returnUserID,
          todoID: returnTodoID,
          content: newTodo.content,
          isCompleted: newTodo.isCompleted,
        };
      } catch (err) {
        throw new Error(err);
      }
    },
    updateTodo: async (parent, args, { dynamodb }, info): Promise<Todo> => {
      try {
        const { userID, todoID, content, isCompleted } = args.todo;

        if (
          userID.trim().length === 0 ||
          todoID.trim().length === 0 ||
          content.trim().length === 0
        ) {
          throw new Error('userID, todoID and content cannot be empty');
        }
        const updateAttributes = [];
        const expressionAttributeNames = {};
        const expressionAttributeValues = {};

        if (content !== undefined) {
          updateAttributes.push('#content = :content');
          expressionAttributeNames['#content'] = 'content';
          expressionAttributeValues[':content'] = content;
        }
        if (isCompleted !== undefined) {
          updateAttributes.push('#isCompleted = :isCompleted');
          expressionAttributeNames['#isCompleted'] = 'isCompleted';
          expressionAttributeValues[':isCompleted'] = isCompleted;
        }

        const updateExpression = 'SET ' + updateAttributes.join(',');

        const params = {
          TableName: env.DYNAMODB_TABLE_NAME,
          Key: {
            pk: env.TODO_APP_PK,
            sk: generateTodoSortKey(userID, todoID),
          },
          ConditionExpression: 'attribute_exists(pk) AND attribute_exists(sk)',
          UpdateExpression: updateExpression,
          ExpressionAttributeNames: expressionAttributeNames,
          ExpressionAttributeValues: expressionAttributeValues,
          ReturnValues: 'ALL_NEW',
        };

        const res = await dynamodb.update(params).promise();
        const returnTodo = res.Attributes;
        const [_, returnUserID, returnTodoID] = returnTodo.sk.split('::');

        return {
          userID: returnUserID,
          todoID: returnTodoID,
          content: returnTodo.content,
          isCompleted: returnTodo.isCompleted,
        };
      } catch (err) {
        if (err.code === 'ConditionalCheckFailedException') {
          throw new Error(
            'Todo with the provided user and todo does not exist'
          );
        } else throw err;
      }
    },
    deleteTodo: async (parent, args, { dynamodb }, info): Promise<Todo> => {
      try {
        const { userID, todoID } = args;

        if (userID.trim().length === 0 || todoID.trim().length === 0) {
          throw new Error('userID and todoID cannot be empty');
        }

        const params = {
          TableName: env.DYNAMODB_TABLE_NAME,
          Key: {
            pk: env.TODO_APP_PK,
            sk: generateTodoSortKey(userID, todoID),
          },
          ConditionExpression: 'attribute_exists(pk) AND attribute_exists(sk)',
          ReturnValues: 'ALL_OLD',
        };

        const res = await dynamodb.delete(params).promise();

        const returnTodo = res.Attributes;
        const [_, returnUserID, returnTodoID] = returnTodo.sk.split('::');

        return {
          userID: returnUserID,
          todoID: returnTodoID,
          content: returnTodo.content,
          isCompleted: returnTodo.isCompleted,
        };
      } catch (err) {
        if (err.code === 'ConditionalCheckFailedException') {
          throw new Error(
            'Todo with the provided user and todo does not exist'
          );
        }
        throw err;
      }
    },
  },
};
