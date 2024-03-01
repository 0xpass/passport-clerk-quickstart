// @ts-ignore
"use client";
import { useEffect, useRef, useState } from "react";
import { Passport } from "@0xpass/passport";
import { WebauthnSigner } from "@0xpass/webauthn-signer";
import { createPassportClient } from "@0xpass/passport-viem";
import { http, WalletClient } from "viem";
import { mainnet } from "viem/chains";

const ENCLAVE_PUBLIC_KEY =
  "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAvQOa1gkatuN6KjaS4KEWsVZAN9i4Cf0j9jlmBW5RwCJ3Bxo32McP7axt4Ev6sMWM24lpCgXgu68S9KBYRcrcEB6dRcaupFGd+ER7M518fiJ0VtCZ+XRnmwn9fqEvotp9DPZOysJkUQ60kugCRKwNvfZzAFcDiubwiqsUY2sCm943a/u9Hym51SEetG+ZFPJZFOBqwRSGkOgGZ+9Ac7ITE+bWLCZk9DlzRu+BIoDOFzXZIn+/0a0X8BnLtRY4g50aew4J+4OllQagBbhYnPMvYExYIEUx6bdjQicw0Js6s2pHr+SFAX23kQtbVOVxb5+KEGp1d+6Q4Gx7FBoyWI5qPQIDAQAB";

export default function Page() {
  const [username, setUsername] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [authenticating, setAuthenticating] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [completingRegistration, setCompletingRegistration] = useState(false);
  const [signMessageLoading, setSignMessageLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageSignature, setMessageSignature] = useState("");
  const [authenticatedHeader, setAuthenticatedHeader] = useState({});
  const [challengeId, setChallengeId] = useState();
  const [credentialCreationOptions, setCredentialCreationOptions] = useState(
    {}
  );
  const [encryptedUser, setEncryptedUser] = useState();
  const [address, setAddress] = useState<string>();

  const alchemyUrl = process.env.NEXT_PUBLIC_ALCHEMY_URL!;
  const fallbackProvider = http(alchemyUrl);

  const userInput = {
    username: username,
    userDisplayName: username,
  };

  const signer = useRef<WebauthnSigner>();
  const passport = useRef<Passport>();

  useEffect(() => {
    if (!signer.current) {
      signer.current = new WebauthnSigner({
        rpId: window.location.hostname,
        rpName: "0xPass",
      });
    }

    if (!passport.current) {
      passport.current = new Passport({
        scope_id: "07907e39-63c6-4b0b-bca8-377d26445172",
        signer: signer.current!,
        enclave_public_key: ENCLAVE_PUBLIC_KEY,
      });
    }
  }, []);

  async function initiateRegistration() {
    setRegistering(true);
    try {
      await passport.current?.setupEncryption();
      const res = await passport.current?.initiateRegistration(userInput);
      console.log(res);

      setChallengeId(res.challenge_id);
      setEncryptedUser(res.encrypted_user);
      setCredentialCreationOptions(res.cco_json);
      setCompletingRegistration(true);
    } catch (error) {
      console.error("Error registering:", error);
    } finally {
      setRegistering(false);
    }
  }

  async function completeRegistration() {
    setRegistering(true);
    try {
      await passport.current?.setupEncryption();
      const res = await passport.current?.completeRegistration(
        encryptedUser,
        challengeId,
        credentialCreationOptions
      );
      console.log(res);
      setCompletingRegistration(false);
      // @ts-ignore
      if (res.result.account_id) {
        setRegistering(false);
        setAuthenticating(true);
        await authenticate();
        setAuthenticating(false);
      }
    } catch (error) {
      console.error("Error registering:", error);
    } finally {
      setRegistering(false);
      setAuthenticating(false);
    }
  }

  async function authenticate() {
    setAuthenticating(true);
    try {
      await passport.current?.setupEncryption();
      const [authenticatedHeader, address] =
        await passport.current?.authenticate(userInput)!;
      setAuthenticatedHeader(authenticatedHeader);
      console.log(address);
      setAddress(address);
      setAuthenticated(true);
    } catch (error) {
      console.error("Error registering:", error);
    } finally {
      setAuthenticating(false);
    }
  }

  function createWalletClient() {
    return createPassportClient(authenticatedHeader, fallbackProvider, mainnet);
  }

  async function signMessage(message: string) {
    try {
      setSignMessageLoading(true);
      const client = createWalletClient();
      const response = await client.signMessage({
        account: "0x00",
        message,
      });

      setMessageSignature(response);
      setSignMessageLoading(false);
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-white text-black">
      <div
        className={`text-2xl font-bold mb-8 ${
          authenticated ? "text-green-500" : "text-red-500"
        }`}
      >
        {authenticated ? "Authenticated" : "Not authenticated"}
      </div>
      <div className="text-center">
        <h1 className="text-3xl font-bold underline">0xPass Quickstart</h1>
        <p className="mt-2 text-lg">
          This is a quickstart guide for the 0xPass Passport SDK.
        </p>

        <div className="flex flex-col mt-4 space-y-4">
          {authenticated ? (
            <div className="flex flex-col space-y-4">
              <div className="flex items-center justify-between">
                <div className="font-bold">Address</div>
                <div>{address}</div>
              </div>
            </div>
          ) : null}
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="border border-1 rounded p-2 border-black mb-4 ml-2 text-center"
            placeholder="Enter unique username"
          />
          <button
            onClick={initiateRegistration}
            disabled={registering}
            className="border border-1 rounded p-2 border-black mb-4 ml-2"
          >
            {registering && !completingRegistration
              ? "Registering..."
              : "Initiate Registration"}
          </button>
          <span className="text-green-500">
            {completingRegistration && "Ready to complete registration"}
          </span>
          <button
            onClick={completeRegistration}
            className="border border-1 rounded p-2 border-black mb-4 ml-2"
          >
            {registering && completingRegistration
              ? "Registering..."
              : authenticating
              ? "Authenticating..."
              : "Complete Registration"}
          </button>
          <button
            onClick={authenticate}
            disabled={authenticating}
            className="border border-1 rounded p-2 border-black mb-4 ml-2"
          >
            Authenticate
          </button>

          <div>Requires authentication to Sign Message</div>

          {messageSignature && (
            <div className="flex flex-col space-y-4">
              <div className="font-bold">Message Signature</div>
              <div>{messageSignature}</div>
            </div>
          )}

          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="border border-1 rounded p-2 border-black mb-4 ml-2 text-center"
            placeholder="Message to sign"
          />
          <button
            onClick={async () => await signMessage(message)}
            disabled={signMessageLoading}
            className="border border-1 rounded p-2 border-black mb-4 ml-2"
          >
            Sign Message
          </button>
        </div>
      </div>
    </div>
  );
}
