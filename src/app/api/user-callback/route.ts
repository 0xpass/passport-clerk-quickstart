import { NextResponse } from "next/server";
import { KeySigner } from "@0xpass/key-signer";
import { Passport } from "@0xpass/passport";

export async function POST(req: Request) {
  const payload = await req.json();

  const keySigner = new KeySigner(process.env.NEXT_PUBLIC_PRIVATE_KEY!, true);
  const passport = new Passport({
    scope_id: process.env.NEXT_PUBLIC_SCOPE_ID!,
    signer: keySigner,
  });

  await passport.setupEncryption();
  const data = await passport.delegatedRegisterAccount({
    username: payload.emailAddress,
  });

  return NextResponse.json(data);
}
