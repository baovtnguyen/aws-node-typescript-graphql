import { mergeResolvers, mergeTypeDefs } from '@graphql-tools/merge';

import { todoTypes, todoResolvers } from './todo';

export const typeDefs = mergeTypeDefs([todoTypes]);

export const resolvers = mergeResolvers([todoResolvers]);
