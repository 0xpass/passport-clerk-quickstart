import { WebauthnSigner } from "@0xpass/webauthn-signer";
import { Passport } from "@0xpass/passport";

interface PassportAuthProps {
  ENCLAVE_PUBLIC_KEY: string;
  scope_id: string;
  endpoint?: string;
}

export function usePassport({
  ENCLAVE_PUBLIC_KEY,
  scope_id,
  endpoint = "https://tiramisu.0xpass.io",
}: PassportAuthProps): {
  passport: Passport;
  signer: WebauthnSigner;
} {
  const signer = new WebauthnSigner({
    rpId: "localhost",
    rpName: "0xPass",
  });

  const passport = new Passport({
    scope_id: scope_id,
    signer: signer,
    enclave_public_key: ENCLAVE_PUBLIC_KEY,
    endpoint: endpoint,
  });

  return {
    passport,
    signer,
  };
}
