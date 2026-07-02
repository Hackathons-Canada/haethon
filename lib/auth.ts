import { auth, currentUser } from "@clerk/nextjs/server";

import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

type SessionMetadata = {
  role?: "user" | "admin" | "organizer" | "sponsor";
};

export async function getCurrentRole() {
  const { sessionClaims } = await auth();

  return ((sessionClaims?.metadata as SessionMetadata | undefined)?.role ?? "user") as NonNullable<SessionMetadata["role"]>;
}

export async function requireAdmin() {
  const { userId } = await auth();

  if (!userId) {
    return { ok: false as const, reason: "unauthenticated" };
  }

  const role = await getCurrentRole();

  if (role !== "admin") {
    return { ok: false as const, reason: "forbidden" };
  }

  return { ok: true as const };
}

export async function syncCurrentUser() {
  const user = await currentUser();

  if (!user?.primaryEmailAddress?.emailAddress) {
    return null;
  }

  await db
    .insert(users)
    .values({
      clerkUserId: user.id,
      email: user.primaryEmailAddress.emailAddress,
      firstName: user.firstName,
      lastName: user.lastName,
      imageUrl: user.imageUrl,
    })
    .onConflictDoUpdate({
      target: users.clerkUserId,
      set: {
        email: user.primaryEmailAddress.emailAddress,
        firstName: user.firstName,
        lastName: user.lastName,
        imageUrl: user.imageUrl,
        updatedAt: new Date(),
      },
    });

  return user;
}
