import { mergeTypeDefs } from '@graphql-tools/merge';

import todoType from './todoType';

const types = [todoType];

export default mergeTypeDefs(types);
