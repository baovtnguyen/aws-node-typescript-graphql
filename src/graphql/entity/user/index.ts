import resolvers from './resolvers';
import query from './query';
import mutation from './mutation';
import types from './types';

export const userTypes = types;

export const userResolvers = {
  ...query,
  ...resolvers,
  ...mutation,
};
