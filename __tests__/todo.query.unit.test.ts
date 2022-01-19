import Resolvers from '../src/graphql/entity/todo/query';
import AWS from 'aws-sdk';
import { mocked } from 'jest-mock';
import env from '../src/libs/env';

const { getTodos, getTodosOfUser } = Resolvers.Query;

jest.mock('aws-sdk', () => {
  return {
    DynamoDB: {
      DocumentClient: jest.fn(),
    },
  };
});

describe('Todo Query Resolvers', () => {
  let queryMocked: jest.Mock;
  let queryMockedPromise: jest.Mock;

  beforeEach(() => {
    jest.resetModules();
    queryMocked = jest.fn();
    queryMockedPromise = jest.fn();

    queryMocked.mockReturnValue({
      promise: queryMockedPromise,
    });
    mocked(AWS.DynamoDB.DocumentClient).mockImplementation(() => {
      return { query: queryMocked } as unknown as AWS.DynamoDB.DocumentClient;
    });
  });

  afterAll(() => {
    jest.resetAllMocks();
  });
  describe('Get all todos', () => {
    it('should get all todos when everything is OK', async () => {
      // Arrange
      const mResult = {
        Items: [
          {
            pk: 'TODO_APP',
            sk: 'TODO::1::5215',
            content: 'Learn Graphql-tools',
            isCompleted: true,
          },
          {
            pk: 'TODO_APP',
            sk: 'TODO::1::5352',
            content: 'Learn Unit test',
            isCompleted: false,
          },
        ],
      };

      const mDynamoDb = new AWS.DynamoDB.DocumentClient();
      const mContext = { dynamodb: mDynamoDb };
      queryMockedPromise.mockResolvedValue(mResult);

      // Act
      const actual = await getTodos(undefined, undefined, mContext, undefined);

      // Assert
      expect(mDynamoDb.query).toBeCalledTimes(1);
      expect(mDynamoDb.query).toHaveBeenCalledWith({
        TableName: env.DYNAMODB_TABLE_NAME,
        KeyConditionExpression: `#pk = :pk and begins_with(#sk, :sk)`,
        ExpressionAttributeNames: {
          '#pk': 'pk',
          '#sk': 'sk',
        },
        ExpressionAttributeValues: {
          ':pk': env.TODO_APP_PK,
          ':sk': 'TODO',
        },
      });
      expect(actual).toEqual([
        {
          userID: '1',
          todoID: '5215',
          content: 'Learn Graphql-tools',
          isCompleted: true,
        },
        {
          userID: '1',
          todoID: '5352',
          content: 'Learn Unit test',
          isCompleted: false,
        },
      ]);
    });

    it('should throw network error when the connection to DB failed due to network', async () => {
      // Arrange
      const mDynamoDb = new AWS.DynamoDB.DocumentClient();
      const mContext = { dynamodb: mDynamoDb };
      const mError = new Error('network');
      queryMockedPromise.mockRejectedValue(mError);

      // Act
      const getTodosFn = getTodos.bind(
        null,
        undefined,
        undefined,
        mContext,
        undefined
      );

      // Assert
      expect(getTodosFn()).rejects.toThrowError('network');

      expect(mDynamoDb.query).toBeCalledTimes(1);

      expect(mDynamoDb.query).toHaveBeenCalledWith({
        TableName: env.DYNAMODB_TABLE_NAME,
        KeyConditionExpression: `#pk = :pk and begins_with(#sk, :sk)`,
        ExpressionAttributeNames: {
          '#pk': 'pk',
          '#sk': 'sk',
        },
        ExpressionAttributeValues: {
          ':pk': env.TODO_APP_PK,
          ':sk': 'TODO',
        },
      });
    });
  });

  describe('Get all todos of a user', () => {
    it('should get all todos of a user when everything is OK', async () => {
      //Arrange
      const mResult = {
        Items: [
          {
            pk: 'TODO_APP',
            sk: 'TODO::1::5215',
            content: 'Learn Graphql-tools',
            isCompleted: true,
          },
          {
            pk: 'TODO_APP',
            sk: 'TODO::1::5352',
            content: 'Learn Unit test',
            isCompleted: false,
          },
        ],
      };

      const args = {
        userID: '1',
      };

      const mDynamoDb = new AWS.DynamoDB.DocumentClient();
      const mContext = { dynamodb: mDynamoDb };
      queryMockedPromise.mockResolvedValue(mResult);

      // Act
      const actual = await getTodosOfUser(undefined, args, mContext, undefined);

      // Assert
      expect(mDynamoDb.query).toBeCalledTimes(1);
      expect(mDynamoDb.query).toHaveBeenCalledWith({
        TableName: env.DYNAMODB_TABLE_NAME,
        KeyConditionExpression: `#pk = :pk and begins_with(#sk, :sk)`,
        ExpressionAttributeNames: {
          '#pk': 'pk',
          '#sk': 'sk',
        },
        ExpressionAttributeValues: {
          ':pk': env.TODO_APP_PK,
          ':sk': 'TODO::1',
        },
      });
      expect(actual).toEqual([
        {
          userID: '1',
          todoID: '5215',
          content: 'Learn Graphql-tools',
          isCompleted: true,
        },
        {
          userID: '1',
          todoID: '5352',
          content: 'Learn Unit test',
          isCompleted: false,
        },
      ]);
    });

    it('should throw error when userID is empty string', async () => {
      //Arrange
      const mArgs = {
        userID: '',
      };
      const mContext = {
        dynamodb: {},
      };

      // Act
      const getTodosOfUserFn = getTodosOfUser.bind(
        null,
        undefined,
        mArgs,
        mContext,
        undefined
      );

      // Assert
      expect(getTodosOfUserFn()).rejects.toThrowError('userID cannot be empty');
    });

    it('should throw network error when the connection to DB failed due to network', async () => {
      // Arrange
      const mArgs = {
        userID: '1',
      };
      const mDynamoDb = new AWS.DynamoDB.DocumentClient();
      const mContext = { dynamodb: mDynamoDb };
      const mError = new Error('network');
      queryMockedPromise.mockRejectedValue(mError);

      // Act
      const getTodosOfUserFn = getTodosOfUser.bind(
        null,
        undefined,
        mArgs,
        mContext,
        undefined
      );

      // Assert
      expect(getTodosOfUserFn()).rejects.toThrowError('network');

      // Assert
      expect(mDynamoDb.query).toBeCalledTimes(1);
      expect(mDynamoDb.query).toHaveBeenCalledWith({
        TableName: env.DYNAMODB_TABLE_NAME,
        KeyConditionExpression: `#pk = :pk and begins_with(#sk, :sk)`,
        ExpressionAttributeNames: {
          '#pk': 'pk',
          '#sk': 'sk',
        },
        ExpressionAttributeValues: {
          ':pk': env.TODO_APP_PK,
          ':sk': 'TODO::1',
        },
      });
    });
  });
});
