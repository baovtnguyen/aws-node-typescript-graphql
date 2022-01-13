import env from './env';

export const generateTodoSortKey = (userID?: string, todoID?: string) => {
  if (userID) {
    if (todoID) return `${env.PREFIX_TODO_SK}::${userID}::${todoID}`;
    else return `${env.PREFIX_TODO_SK}::${userID}`;
  }
  else return `${env.PREFIX_TODO_SK}`;
};

export const generateMetadataSortKey = (userID) =>
  `${env.PREFIX_USER_SK}::${userID}`;
