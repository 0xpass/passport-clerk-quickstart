import { currentUser } from "@clerk/nextjs/server";
import { KeySigner } from "@0xpass/key-signer";
import { Passport } from "@0xpass/passport";

export async function GET() {
  try {
    const user = await currentUser();

    if (!user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const keySigner = new KeySigner(process.env.PRIVATE_KEY!, true);
    const passport = new Passport({
      scope_id: process.env.NEXT_PUBLIC_SCOPE_ID!,
      signer: keySigner,
    });

    passport.setUserData({ username: user.emailAddresses[0].emailAddress });
    await passport.setupEncryption();
    const addresses = await passport.getAddresses();

    return new Response(JSON.stringify(addresses), { status: 200 });
  } catch (error) {
    console.log(error);
    return new Response("Something went wrong", { status: 500 });
  }
}
