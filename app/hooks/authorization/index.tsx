import React, {
  createContext, useState, useContext,
} from 'react';

import AUTHENTICATION from 'services/authorization';

const AuthContext = createContext({
  token: null,
  signin: (data) => { console.info(data); },
  signup: (data) => { console.info(data); },
  signout: () => {},
});

// Provider hook that creates auth object and handles state
function useProvideAuth() {
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Wrap any Firebase methods we want to use making sure ...
  // ... to save the user to state.
  const signin = async (data) => {
    // Get token
    try {
      const t = await AUTHENTICATION
        .request({
          method: 'POST',
          url: '/login',
          data,
        });

      setToken(t.data.accessToken);
      localStorage.setItem('token', t.data.accessToken);
      return t;
    } catch (error) {
      setToken(null);
      localStorage.setItem('token', null);

      console.error(error);
      return error;
    }
  };

  const signup = async (data) => {
    try {
      await AUTHENTICATION
        .request({
          method: 'POST',
          url: '/sign-up',
          data,
        });

      const t = await signin(data);

      setToken(t.data.accessToken);
      localStorage.setItem('token', t.data.accessToken);
      return t;
    } catch (error) {
      setToken(null);
      localStorage.setItem('token', null);
      console.error(error);
      return error;
    }
  };

  const signout = async () => {
    // const response = await AUTHENTICATION
    //   .request({
    //     method: 'GET',
    //     url: '/logout',
    //   });

    // console.info(response);
    setToken(null);
    localStorage.setItem('token', null);
  };

  // Return the user object and auth methods
  return {
    token,
    signin,
    signup,
    signout,
  };
}

// Hook for child components to get the auth object ...
// ... and re-render when it changes.
export const useAuth = () => {
  return useContext(AuthContext);
};

interface AuthorizationProviderProps {
  children: React.ReactNode
}
// Provider component that wraps your app and makes auth object ...
// ... available to any child component that calls useAuth().
export function AuthorizationProvider({ children }: AuthorizationProviderProps) {
  const auth = useProvideAuth();

  return (
    <AuthContext.Provider
      value={auth}
    >
      {children}
    </AuthContext.Provider>
  );
}
