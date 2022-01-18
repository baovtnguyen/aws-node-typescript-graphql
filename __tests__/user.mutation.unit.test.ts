import MutationResolvers from '../src/graphql/entity/user/mutation';

const {
  Mutation: { createUser },
} = MutationResolvers;

// SETUP
const context = {
  dynamodb: {
    put: null,
  },
};

// Test cases
describe('User Mutation Resolvers -> Create A User', () => {
  test('Should create a user when everything is OK', async () => {
    // Arrange
    const args = {
      data: {
        name: 'Tieu Bao',
        title: 'Fresher Software Developer',
      },
    };

    context.dynamodb.put = jest.fn((params) => {
      return {
        promise() {
          return Promise.resolve(true);
        },
      };
    });

    // Act
    const res = await createUser(null, args, context, null);

    // Assert
    expect(res).toHaveProperty('userID');
    expect(res).toMatchObject({ name: args.data.name, title: args.data.title });
  });

  test('Should throw an error when name is empty', async () => {
    // Arrange
    const args = {
      data: { name: '  ', title: 'Learn Unit Test'},
    }

    // Act
    // Assert
    await expect(createUser(null, args, context, null)).rejects.toThrow();
  });

  test('Should throw an error when title is empty', async () => {
    // Arrange
    const args = {
      data: { name: 'Tieu bao', title: '     '},
    }

    // Act
    // Assert
    await expect(createUser(null, args, context, null)).rejects.toThrow();
  });
});
