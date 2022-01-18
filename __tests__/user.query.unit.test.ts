import QueryResolvers from '../src/graphql/entity/user/query';

const {
  Query: { getUsers },
} = QueryResolvers;

// SETUP
const context = {
  dynamodb: {
    query: null,
  },
};

// Test cases
describe('User Query Resolvers -> Get Users', () => {
  test('Should return all users when everything is OK', async () => {
    // Arrange
    const DUMMY_USERS = [
      {
        pk: process.env.TODO_APP_PK,
        sk: `${process.env.PREFIX_USER_SK}::2591`,
        name: 'Tieu Bao',
        title: 'Fresher Software Developer',
      },
      {
        pk: process.env.TODO_APP_PK,
        sk: `${process.env.PREFIX_USER_SK}::1234`,
        name: 'Elon Musk',
        title: 'Senior Software Developer',
      },
    ];

    context.dynamodb.query = jest.fn((params) => {
      return {
        promise() {
          return Promise.resolve({
            Items: DUMMY_USERS,
          });
        },
      };
    });

    // Act
    const res = await getUsers(null, null, context, null);

    // Assert
    expect(res.length).toBe(DUMMY_USERS.length);
    expect(res[0]).toEqual({
      userID: DUMMY_USERS[0].sk.split("::")[1],
      name: DUMMY_USERS[0].name,
      title: DUMMY_USERS[0].title,
    });
    expect(res[1]).toEqual({
      userID: DUMMY_USERS[1].sk.split("::")[1],
      name: DUMMY_USERS[1].name,
      title: DUMMY_USERS[1].title,
    });
  });

  test('Should throw an error when the connection to database fails', async () => {
    // Arrange
    context.dynamodb.query = jest.fn((params) => {
      return {
        promise() {
          return Promise.reject(new Error('error'));
        },
      };
    });

    // Assert
    // Act
    expect(getUsers(null, {}, context, null)).rejects.toThrowError('error');
  });
})

