import { NextResponse } from "next/server";
import { KeySigner } from "@0xpass/key-signer";
import { Passport } from "@0xpass/passport";

export async function GET(req: Request) {
  return new Response(`Hello, world!, ${req.url}`);
}

export async function POST(req: Request) {
  const payload = await req.json();

  const keySigner = new KeySigner(process.env.NEXT_PUBLIC_PRIVATE_KEY!, true);

  const passport = new Passport({
    endpoint: process.env.NEXT_PUBLIC_ENDPOINT!,
    scope_id: process.env.NEXT_PUBLIC_SCOPE_ID!,
    signer: keySigner,
    enclave_public_key: process.env.NEXT_PUBLIC_ENCLAVE_PUBLIC_KEY!,
  });

  await passport.setupEncryption();
  const data = await passport.delegatedRegisterAccount({
    username: payload.emailAddress,
  });

  return NextResponse.json(data);
}
