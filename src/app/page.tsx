"use client";
import { useState } from "react";
import { SignUpButton, useUser } from "@clerk/nextjs";
import { useEffect } from "react";

export default function Page() {
  const { isSignedIn, isLoaded } = useUser();
  const [signMessageLoading, setSignMessageLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageSignature, setMessageSignature] = useState("");
  const [address, setAddress] = useState<string>();
  const [addressLoading, setAddressLoading] = useState(false);

  const fetchDelegatedAddress = async () => {
    setAddressLoading(true);
    try {
      if (!addressLoading) {
        console.log("fetchDelegatedAddress");
        const response = await fetch("/api/get-account", {
          method: "GET",
        });

        if (response.ok) {
          const addresses = await response.json();
          setAddress(addresses.result[0]);
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      setAddressLoading(false);
    }
  };

  useEffect(() => {
    console.log("HELLO");
    if (isSignedIn) {
      fetchDelegatedAddress();
    }
  }, [isSignedIn]);

  async function delegatedSignMessage(message: string) {
    setSignMessageLoading(true);
    try {
      const startTime = performance.now();
      let response = await fetch("/api/sign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "message",
          data: message,
        }),
      });

      if (response.ok) {
        const { signature } = await response.json();
        console.log(signature);
        const timeTaken = performance.now() - startTime;
        setMessageSignature({
          signature: signature.result,
          timeTaken: timeTaken,
        });
      } else {
        throw Error(`HTTP error: ${response}`);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSignMessageLoading(false);
    }
  }

  if (!isLoaded) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <svg
          className="animate-spin h-12 w-12 text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M22 12c0-5.522-4.477-10-10-10-1.065 0-2.098.166-3.051.47l1.564 1.564A8 8 0 0112 4c4.418 0 8 3.582 8 8h-2z"
          ></path>
        </svg>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-white text-black">
      <p>Connected account: {addressLoading ? "Loading..." : address} </p>

      <div
        className={`text-2xl font-bold mb-8 ${
          isSignedIn ? "text-green-500" : "text-red-500"
        }`}
      >
        {isSignedIn ? "Authenticated" : "Not authenticated"}
      </div>
      <div className="text-center">
        <h1 className="text-3xl font-bold underline">
          Passport Protocol with Clerk Auth Quickstart
        </h1>
        <p className="mt-2 text-lg">
          This is a quickstart guide for the Passport Protocol SDK.
        </p>

        <div className="flex flex-col mt-4 space-y-4">
          {isSignedIn ? (
            <>
              <div className="flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                  <div className="font-bold">Address</div>
                  <div>{address}</div>
                </div>
              </div>

              {messageSignature && (
                <div className="flex flex-col space-y-4 max-w-[60ch] break-words">
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
                onClick={async () => await delegatedSignMessage(message)}
                disabled={signMessageLoading}
                className="border border-1 rounded p-2 border-black mb-4 ml-2"
              >
                {signMessageLoading ? "Signing..." : "Sign Message"}
              </button>
            </>
          ) : (
            <div className="mb-12 flex flex-col space-y-2 mt-8">
              <SignUpButton
                mode="modal"
                afterSignInUrl="/auth/callback"
                afterSignUpUrl="/auth/callback"
              >
                <button className="border border-1 rounded p-2 border-black mb-4 w-full">
                  Sign Up / In With Clerk
                </button>
              </SignUpButton>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
