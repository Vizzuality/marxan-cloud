export interface User {
  email: string;
  isFetched: boolean;
}

export interface AuthContextProps {
  user: User;
  successRedirect: string;
  errorRedirect: string;
  signin: (data: any) => void;
  signout: () => void;
  signup: (data: any) => void;
}
