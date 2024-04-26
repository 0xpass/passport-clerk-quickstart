import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { KeySigner } from "@0xpass/key-signer";
import { Passport } from "@0xpass/passport";
import { stringToHex } from "viem";

export async function POST(req: Request) {
  const payload = await req.json();
  const { type, data } = payload;

  const user = await currentUser();

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  console.log("process.env.PRIVATE_KEY", process.env.PRIVATE_KEY);
  const keySigner = new KeySigner(process.env.PRIVATE_KEY!, true);

  const passport = new Passport({
    endpoint: process.env.NEXT_PUBLIC_ENDPOINT!,
    scope_id: process.env.NEXT_PUBLIC_SCOPE_ID!,
    signer: keySigner,
    enclave_public_key: process.env.NEXT_PUBLIC_ENCLAVE_PUBLIC_KEY!,
  });

  passport.setUserData({ username: user.emailAddresses[0].emailAddress });
  await passport.setupEncryption();

  console.log(data);
  if (type === "message") {
    console.log("sign message:::::");
    const signature = await passport.signMessage(stringToHex(data));
    console.log("signature", signature);
    return NextResponse.json({ signature });
  } else if (type === "transaction") {
    const signature = await passport.signTransaction(data);
    return NextResponse.json({ signature });
  } else {
    return new Response("Invalid type", { status: 400 });
  }
}
