import { UserName } from "../users/UsersTypes";

export type AppState = {
  searchexpression:string;
  currentUser: UserName;
}