import { gql } from "apollo-server-lambda";

export default gql`
  type Todo {
    todoID: String!
    userID: String!
    content: String!
    isCompleted: Boolean!
  }

  input TodoInput {
    userID: String!
    todoID: String!
    content: String
    isCompleted: Boolean = false
  }

  type Query {
    getTodos: [Todo!]!
    getTodosOfUser(userID: String!): [Todo!]!
  }

  type Mutation {
    createTodo(userID: String!, content: String): Todo!
    deleteTodo(userID: String!, todoID: String!): Todo!
    updateTodo(todo: TodoInput!): Todo!
  }
`
