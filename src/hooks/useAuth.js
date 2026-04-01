import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  // Return only what the components need
  return {
    user: context.user,
    deviceToken: context.deviceToken,
    isReady: context.isReady,
    sendBinary: context.sendBinary,
    // You can add helper methods here
    isLoggedIn: !!context.user
  };
};

export default useAuth;