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
test('should create a user', async () => {
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

test('should throw error when create a user', async () => {
  // Arrange
  context.dynamodb.put = jest.fn((params) => {
    return {
      promise() {
        return Promise.reject(new Error('error'));
      },
    };
  });

  // Act
  // Assert
  expect(createUser(null, { data: {} }, context, null)).rejects.toThrowError(
    'error'
  );
});
