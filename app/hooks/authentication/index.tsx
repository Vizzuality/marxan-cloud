import React, {
  createContext, useContext, useMemo,
} from 'react';
import { useQuery } from 'react-query';

import LOCAL from 'services/local';

const AuthContext = createContext({
  user: null,
  successRedirect: '',
  errorRedirect: '',
  signin: (data) => { console.info(data); },
  signup: (data) => { console.info(data); },
  signout: () => {},
});

// Provider hook that creates auth object and handles state
function useProvideAuth(options) {
  const { successRedirect, errorRedirect } = options;

  const signin = async (data) => {
    // Get user
    try {
      const t = await LOCAL
        .request({
          method: 'POST',
          url: '/sign-in',
          data,
        });

      window.location.href = successRedirect;
      return t;
    } catch (error) {
      console.error(error);
      return error;
    }
  };

  const signup = async (data) => {
    try {
      await LOCAL
        .request({
          method: 'POST',
          url: '/sign-up',
          data,
        });

      const t = await signin(data);
      return t;
    } catch (error) {
      console.error(error);
      return error;
    }
  };

  const signout = async () => {
    await LOCAL
      .request({
        method: 'POST',
        url: '/sign-out',
      });

    window.location.href = errorRedirect;
  };

  // Return the user object and auth methods
  return {
    successRedirect,
    errorRedirect,
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

// Hook for child components to get the user object ...
// ... and re-render when it changes.
function useMe() {
  const query = useQuery('me', async () => LOCAL.request({
    method: 'GET',
    url: '/me',
  }));

  const { data } = query;

  return useMemo(() => {
    return {
      ...query,
      user: data?.data,
    };
  }, [query, data?.data]);
}

interface AuthorizationProviderProps {
  successRedirect: string;
  errorRedirect: string;
  children: React.ReactNode;

}
// Provider component that wraps your app and makes auth object ...
// ... available to any child component that calls useAuth().
export function AuthorizationProvider({
  successRedirect,
  errorRedirect,
  children,
}: AuthorizationProviderProps) {
  const auth = useProvideAuth({ successRedirect, errorRedirect });
  const user = useMe();

  return (
    <AuthContext.Provider
      value={{
        ...auth,
        ...user,
      }}
    >
      {user.isFetched && children}
    </AuthContext.Provider>
  );
}
