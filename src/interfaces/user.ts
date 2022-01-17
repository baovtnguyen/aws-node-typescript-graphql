export interface UserInput {
  name: string;
  title: string;
}

export interface User extends UserInput{
  userID: string;
}
