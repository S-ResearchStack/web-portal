import React, { ReactElement, useEffect, useState } from "react";
import loadScript from "src/common/utils/scriptLoader";
import GoogleButton from "react-google-button";

export interface GoogleSignInButtonProps extends React.RefAttributes<HTMLDivElement> {
  onSuccess?: (codeResponse: google.accounts.oauth2.CodeResponse) => void,
  onFailure?: (error: google.accounts.oauth2.ClientConfigError) => void,
}

const GoogleSignInButton = ({
    onSuccess,
    onFailure
}: GoogleSignInButtonProps): ReactElement | null => {
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const style = {
    width: '100%',
    minWidth: '400px',
  };
  const [codeClient, setCodeClient] = useState<google.accounts.oauth2.CodeClient>();

  const onClick = () => {
    codeClient?.requestCode();
  }

  const onScriptLoad = () => {
    if (!googleClientId) return;
    const client = google.accounts.oauth2.initCodeClient({
      client_id: googleClientId,
      scope: 'email',
      callback: onSuccess,
      error_callback: onFailure
    })
    setCodeClient(client);
  }

  const onScriptError = (
    event: Event | string,
    source?: string,
    lineno?: number,
    colno?: number,
    error?: Error) => {
    // TODO: show toast message
    console.log(error)
  }

  useEffect(() => {
    loadScript(
      document,
      'google-sign-in',
      process.env.GOOGLE_OAUTH_URL,
      onScriptLoad,
      onScriptError
    );
  }, [])

  if (!googleClientId) return null;

  return (
    <GoogleButton onClick={() => onClick()} style={style}>GOOGLE</GoogleButton>
  )
}

export default GoogleSignInButton;
