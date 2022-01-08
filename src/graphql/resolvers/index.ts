import path from 'path';

import { mergeResolvers } from '@graphql-tools/merge';

import todoResolvers from './todo.resolvers';

const resolvers = [todoResolvers];

export default mergeResolvers(resolvers);
