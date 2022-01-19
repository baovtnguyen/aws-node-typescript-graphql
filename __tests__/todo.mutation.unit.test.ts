import Resolvers from '../src/graphql/entity/todo/mutation';
import AWS from 'aws-sdk';
import { mocked } from 'jest-mock';
import env from '../src/libs/env';
import { nanoid } from 'nanoid';

const { createTodo, updateTodo, deleteTodo } = Resolvers.Mutation;

jest.mock('aws-sdk', () => {
  return {
    DynamoDB: {
      DocumentClient: jest.fn(),
    },
  };
});

jest.mock('nanoid');

const mnanoid = mocked(nanoid);

describe('Todo Mutation Resolvers', () => {
  let putMocked: jest.Mock;
  let putMockedPromise: jest.Mock;
  let updateMocked: jest.Mock;
  let updateMockedPromise: jest.Mock;
  let deleteMocked: jest.Mock;
  let deleteMockedPromise: jest.Mock;

  beforeEach(() => {
    jest.resetModules();
    putMocked = jest.fn();
    putMockedPromise = jest.fn();

    updateMocked = jest.fn();
    updateMockedPromise = jest.fn();

    deleteMocked = jest.fn();
    deleteMockedPromise = jest.fn();

    putMocked.mockReturnValue({
      promise: putMockedPromise,
    });
    updateMocked.mockReturnValue({
      promise: updateMockedPromise,
    });
    deleteMocked.mockReturnValue({
      promise: deleteMockedPromise,
    });

    mocked(AWS.DynamoDB.DocumentClient).mockImplementation(() => {
      return {
        put: putMocked,
        update: updateMocked,
        delete: deleteMocked,
      } as unknown as AWS.DynamoDB.DocumentClient;
    });
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  describe('Create Todo', () => {
    it('should create a new todo when everything is OK', async () => {
      // Arrange
      const mArgs = {
        userID: '13',
        content: 'Learn Unit test',
      };
      const mockedNanoIDReturnValue = '5253';

      const mDynamoDb = new AWS.DynamoDB.DocumentClient();
      const mContext = { dynamodb: mDynamoDb };

      putMockedPromise.mockResolvedValue({});
      mnanoid.mockReturnValue(mockedNanoIDReturnValue);

      // Act
      const actual = await createTodo(undefined, mArgs, mContext, undefined);

      // Assert
      expect(mDynamoDb.put).toBeCalledTimes(1);
      expect(mDynamoDb.put).toHaveBeenCalledWith({
        TableName: env.DYNAMODB_TABLE_NAME,
        Item: {
          pk: env.TODO_APP_PK,
          sk: `${env.PREFIX_TODO_SK}::${mArgs.userID}::${mockedNanoIDReturnValue}`,
          content: mArgs.content,
          isCompleted: false,
        },
        ConditionExpression:
          'attribute_not_exists(pk) AND attribute_not_exists(sk)',
      });
      expect(actual).toEqual({
        userID: mArgs.userID,
        todoID: mockedNanoIDReturnValue,
        content: mArgs.content,
        isCompleted: false,
      });
    });

    it('should throw error when createTodo arguments are empty string', async () => {
      //Arrange
      const mArgs = {
        userID: '',
      };
      const mContext = {
        dynamodb: {},
      };

      // Act
      const createTodoFn = createTodo.bind(
        null,
        undefined,
        mArgs,
        mContext,
        undefined
      );

      // Assert
      expect(createTodoFn()).rejects.toThrowError(
        'userID and content cannot be empty'
      );
    });

    it('should throw network error when the connection to DB failed due to network', async () => {
      // Arrange
      const mArgs = {
        userID: '1',
        content: 'Learn Unit test',
      };
      const mockedNanoIDReturnValue = '5253';

      const mDynamoDb = new AWS.DynamoDB.DocumentClient();
      const mContext = { dynamodb: mDynamoDb };
      const mError = new Error('network');
      putMockedPromise.mockRejectedValue(mError);
      mnanoid.mockReturnValue(mockedNanoIDReturnValue);

      // Act
      const createTodoFn = createTodo.bind(
        null,
        undefined,
        mArgs,
        mContext,
        undefined
      );

      // Assert
      expect(createTodoFn()).rejects.toThrowError('network');

      // Assert
      expect(mDynamoDb.put).toBeCalledTimes(1);
      expect(mDynamoDb.put).toHaveBeenCalledWith({
        TableName: env.DYNAMODB_TABLE_NAME,
        Item: {
          pk: env.TODO_APP_PK,
          sk: `${env.PREFIX_TODO_SK}::${mArgs.userID}::${mockedNanoIDReturnValue}`,
          content: mArgs.content,
          isCompleted: false,
        },
        ConditionExpression:
          'attribute_not_exists(pk) AND attribute_not_exists(sk)',
      });
    });
  });

  describe('Update Todo', () => {
    it('should update todo when everything is OK', async () => {
      // Arrange
      const mArgs = {
        todo: {
          userID: '13',
          todoID: '5253',
          content: 'Learn Unit test',
          isCompleted: true,
        },
      };
      const mResult = {
        Attributes: {
          pk: env.TODO_APP_PK,
          sk: `${env.PREFIX_TODO_SK}::${mArgs.todo.userID}::${mArgs.todo.todoID}`,
          content: mArgs.todo.content,
          isCompleted: mArgs.todo.isCompleted,
        },
      };
      const mDynamoDb = new AWS.DynamoDB.DocumentClient();
      const mContext = { dynamodb: mDynamoDb };

      updateMockedPromise.mockResolvedValue(mResult);

      // Act
      const actual = await updateTodo(undefined, mArgs, mContext, undefined);

      // Assert
      expect(mDynamoDb.update).toBeCalledTimes(1);
      expect(mDynamoDb.update).toHaveBeenCalledWith({
        TableName: env.DYNAMODB_TABLE_NAME,
        Key: {
          pk: env.TODO_APP_PK,
          sk: `${env.PREFIX_TODO_SK}::${mArgs.todo.userID}::${mArgs.todo.todoID}`,
        },
        ConditionExpression: 'attribute_exists(pk) AND attribute_exists(sk)',
        UpdateExpression: 'SET #content = :content,#isCompleted = :isCompleted',
        ExpressionAttributeNames: {
          '#content': 'content',
          '#isCompleted': 'isCompleted',
        },
        ExpressionAttributeValues: {
          ':content': mArgs.todo.content,
          ':isCompleted': mArgs.todo.isCompleted,
        },
        ReturnValues: 'ALL_NEW',
      });
      expect(actual).toEqual({
        userID: mArgs.todo.userID,
        todoID: mArgs.todo.todoID,
        content: mArgs.todo.content,
        isCompleted: mArgs.todo.isCompleted,
      });
    });

    it('should throw error when updateTodo arguments are empty string', async () => {
      //Arrange
      const mArgs = {
        todo: {
          userID: '',
          todoID: '',
          content: '',
          isCompleted: true,
        },
      };
      const mContext = {
        dynamodb: {},
      };

      // Act
      const updateTodoFn = updateTodo.bind(
        null,
        undefined,
        mArgs,
        mContext,
        undefined
      );

      // Assert
      expect(updateTodoFn()).rejects.toThrowError(
        'userID, todoID and content cannot be empty'
      );
    });

    it('should throw error when the provided todo does not exist', async () => {
      // Arrange
      const mArgs = {
        todo: {
          userID: '13',
          todoID: '5253',
          content: 'Learn Unit test',
          isCompleted: true,
        },
      };

      const mDynamoDb = new AWS.DynamoDB.DocumentClient();
      const mContext = { dynamodb: mDynamoDb };
      const mError = {
        name: 'ConditionalCheckFailedException',
        message: 'The conditional request failed',
        statusCode: 400,
      };
      updateMockedPromise.mockRejectedValue(mError);

      // Act
      const updateTodoFn = updateTodo.bind(
        null,
        undefined,
        mArgs,
        mContext,
        undefined
      );

      //Assert
      const expectedError = {
        name: mError.name,
        message: 'Todo with the provided userID and todoID does not exist',
        statusCode: mError.statusCode,
      };
      await expect(updateTodoFn()).rejects.toMatchObject(expectedError);

      // Assert
      expect(mDynamoDb.update).toBeCalledTimes(1);
      expect(mDynamoDb.update).toHaveBeenCalledWith({
        TableName: env.DYNAMODB_TABLE_NAME,
        Key: {
          pk: env.TODO_APP_PK,
          sk: `${env.PREFIX_TODO_SK}::${mArgs.todo.userID}::${mArgs.todo.todoID}`,
        },
        ConditionExpression: 'attribute_exists(pk) AND attribute_exists(sk)',
        UpdateExpression: 'SET #content = :content,#isCompleted = :isCompleted',
        ExpressionAttributeNames: {
          '#content': 'content',
          '#isCompleted': 'isCompleted',
        },
        ExpressionAttributeValues: {
          ':content': mArgs.todo.content,
          ':isCompleted': mArgs.todo.isCompleted,
        },
        ReturnValues: 'ALL_NEW',
      });
    });

    it('should throw network error when the connection to DB failed due to network', async () => {
      // Arrange
      const mArgs = {
        todo: {
          userID: '13',
          todoID: '5253',
          content: 'Learn Unit test',
          isCompleted: true,
        },
      };

      const mDynamoDb = new AWS.DynamoDB.DocumentClient();
      const mContext = { dynamodb: mDynamoDb };
      const mError = new Error('network');
      updateMockedPromise.mockRejectedValue(mError);

      // Act
      const updateTodoFn = updateTodo.bind(
        null,
        undefined,
        mArgs,
        mContext,
        undefined
      );

      // Assert
      expect(updateTodoFn()).rejects.toThrowError('network');

      // Assert
      expect(mDynamoDb.update).toBeCalledTimes(1);
      expect(mDynamoDb.update).toHaveBeenCalledWith({
        TableName: env.DYNAMODB_TABLE_NAME,
        Key: {
          pk: env.TODO_APP_PK,
          sk: `${env.PREFIX_TODO_SK}::${mArgs.todo.userID}::${mArgs.todo.todoID}`,
        },
        ConditionExpression: 'attribute_exists(pk) AND attribute_exists(sk)',
        UpdateExpression: 'SET #content = :content,#isCompleted = :isCompleted',
        ExpressionAttributeNames: {
          '#content': 'content',
          '#isCompleted': 'isCompleted',
        },
        ExpressionAttributeValues: {
          ':content': mArgs.todo.content,
          ':isCompleted': mArgs.todo.isCompleted,
        },
        ReturnValues: 'ALL_NEW',
      });
    });
  });

  describe('Delete Todo', () => {
    it('should delete a todo when everything is OK', async () => {
      // Arrange
      const mArgs = {
        userID: '13',
        todoID: '5253',
      };
      const mResult = {
        Attributes: {
          pk: env.TODO_APP_PK,
          sk: `${env.PREFIX_TODO_SK}::${mArgs.userID}::${mArgs.todoID}`,
          content: 'Learn Unit test',
          isCompleted: true,
        },
      };

      const mDynamoDb = new AWS.DynamoDB.DocumentClient();
      const mContext = { dynamodb: mDynamoDb };

      deleteMockedPromise.mockResolvedValue(mResult);

      // Act
      const actual = await deleteTodo(undefined, mArgs, mContext, undefined);

      // Assert
      expect(mDynamoDb.delete).toBeCalledTimes(1);
      expect(mDynamoDb.delete).toHaveBeenCalledWith({
        TableName: env.DYNAMODB_TABLE_NAME,
        Key: {
          pk: env.TODO_APP_PK,
          sk: `${env.PREFIX_TODO_SK}::${mArgs.userID}::${mArgs.todoID}`,
        },
        ConditionExpression: 'attribute_exists(pk) AND attribute_exists(sk)',
        ReturnValues: 'ALL_OLD',
      });
      expect(actual).toEqual({
        userID: mArgs.userID,
        todoID: mArgs.todoID,
        content: mResult.Attributes.content,
        isCompleted: mResult.Attributes.isCompleted,
      });
    });

    it('should throw error when deleteTodo arguments are empty string', async () => {
      //Arrange
      const mArgs = {
        userID: '',
        todoID: '',
      };
      const mContext = {
        dynamodb: {},
      };

      // Act
      const deleteTodoFn = deleteTodo.bind(
        null,
        undefined,
        mArgs,
        mContext,
        undefined
      );

      // Assert
      expect(deleteTodoFn()).rejects.toThrowError(
        'userID and todoID cannot be empty'
      );
    });

    it('should should throw error when the provided todo does not exist', async () => {
      // Arrange
      const mArgs = {
        userID: '13',
        todoID: '5253',
      };

      const mDynamoDb = new AWS.DynamoDB.DocumentClient();
      const mContext = { dynamodb: mDynamoDb };
      const mError = {
        name: 'ConditionalCheckFailedException',
        message: 'The conditional request failed',
        statusCode: 400,
      };

      deleteMockedPromise.mockRejectedValue(mError);

      const deleteTodoFn = deleteTodo.bind(
        null,
        undefined,
        mArgs,
        mContext,
        undefined
      );

      //Assert
      const expectedError = {
        name: mError.name,
        message: 'Todo with the provided userID and todoID does not exist',
        statusCode: mError.statusCode,
      };
      await expect(deleteTodoFn()).rejects.toMatchObject(expectedError);

      expect(mDynamoDb.delete).toBeCalledTimes(1);
      expect(mDynamoDb.delete).toHaveBeenCalledWith({
        TableName: env.DYNAMODB_TABLE_NAME,
        Key: {
          pk: env.TODO_APP_PK,
          sk: `${env.PREFIX_TODO_SK}::${mArgs.userID}::${mArgs.todoID}`,
        },
        ConditionExpression: 'attribute_exists(pk) AND attribute_exists(sk)',
        ReturnValues: 'ALL_OLD',
      });
    });

    it('should throw network error when the connection to DB failed due to network', async () => {
      // Arrange
      const mArgs = {
        userID: '13',
        todoID: '5253',
      };

      const mDynamoDb = new AWS.DynamoDB.DocumentClient();
      const mContext = { dynamodb: mDynamoDb };
      const mError = new Error('network');
      deleteMockedPromise.mockRejectedValue(mError);

      // Act
      const deleteTodoFn = deleteTodo.bind(
        null,
        undefined,
        mArgs,
        mContext,
        undefined
      );

      // Assert
      expect(deleteTodoFn()).rejects.toThrowError('network');

      expect(mDynamoDb.delete).toBeCalledTimes(1);
      expect(mDynamoDb.delete).toHaveBeenCalledWith({
        TableName: env.DYNAMODB_TABLE_NAME,
        Key: {
          pk: env.TODO_APP_PK,
          sk: `${env.PREFIX_TODO_SK}::${mArgs.userID}::${mArgs.todoID}`,
        },
        ConditionExpression: 'attribute_exists(pk) AND attribute_exists(sk)',
        ReturnValues: 'ALL_OLD',
      });
    });
  });
});
