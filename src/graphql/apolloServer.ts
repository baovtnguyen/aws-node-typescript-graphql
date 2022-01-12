import { ApolloServer } from 'apollo-server-lambda';

import { typeDefs, resolvers } from './entity';

import dynamodb from '../libs/db';

const NODE_ENV = process.env.NODE_ENV;

const IS_DEV = !NODE_ENV || !['production'].includes(NODE_ENV);

const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  // subscriptions: {},
  introspection: IS_DEV,
  context: {
    dynamodb,
  },
});

export default apolloServer.createHandler();
