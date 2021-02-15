export interface User {
  email: string;
  isFetched: boolean;
  token?: string;
}

export interface AuthContextProps {
  user: User;
  successRedirect: string;
  errorRedirect: string;
  signin: (data: any) => void;
  signout: () => void;
  signup: (data: any) => void;
}
