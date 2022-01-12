import resolvers from './resolvers';
import query from './query';
import mutation from './mutation';
import types from './types';

export const todoTypes = types;

export const todoResolvers = {
  ...query,
  ...resolvers,
  ...mutation,
};
