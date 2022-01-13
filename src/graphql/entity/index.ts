import { mergeResolvers, mergeTypeDefs } from '@graphql-tools/merge';
import { userTypes, userResolvers } from './user';
import { todoTypes, todoResolvers } from './todo';

export const typeDefs = mergeTypeDefs([todoTypes, userTypes]);

export const resolvers = mergeResolvers([todoResolvers, userResolvers]);
