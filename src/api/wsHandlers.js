export const handleServerResponse = (response, setDeviceToken, setUser) => {
  const { type, is_ok, data, message } = response;

  if (!is_ok) {
    console.error(`Error in ${type}: ${message}`);
    return;
  }

  switch (type) {
    case 'server-auth':
      // data contains the UUID/device_token
      setDeviceToken(data.uuid); 
      localStorage.setItem('device_token', data.uuid);
      break;
    case 'login-account':
    case 'get_me':
    case 'resume-session':
      setUser(data); // Store the user object
      break;
    default:
      console.log("Unhandled type:", type);
  }
};