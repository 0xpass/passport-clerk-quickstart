import { currentUser } from "@clerk/nextjs/server";
import { KeySigner } from "@0xpass/key-signer";
import { Passport } from "@0xpass/passport";

export async function GET() {
  try {
    const user = await currentUser();

    console.log("USER", user);

    if (!user) {
      return new Response("Unauthorized", { status: 401 });
    }

    console.log({
      priv: process.env.PRIVATE_KEY!,
      endpoint: process.env.NEXT_PUBLIC_ENDPOINT!,
      scope_id: process.env.NEXT_PUBLIC_SCOPE_ID!,
      enclave_public_key: process.env.NEXT_PUBLIC_ENCLAVE_PUBLIC_KEY!,
    });

    const keySigner = new KeySigner(process.env.PRIVATE_KEY!, true);

    const passport = new Passport({
      endpoint: process.env.NEXT_PUBLIC_ENDPOINT!,
      scope_id: process.env.NEXT_PUBLIC_SCOPE_ID!,
      signer: keySigner,
      enclave_public_key: process.env.NEXT_PUBLIC_ENCLAVE_PUBLIC_KEY!,
    });

    passport.setUserData({ username: user.emailAddresses[0].emailAddress });
    await passport.setupEncryption();
    const addresses = await passport.getAddresses();

    console.log(addresses);
    return new Response(JSON.stringify(addresses), { status: 200 });
  } catch (error) {
    console.log(error);
    return new Response("Something went wrong", { status: 500 });
  }
}
