import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

import { requireAdminUser } from "@/lib/auth";

const f = createUploadthing();

/* Backs the "Upload photo" button on the admin instant-add form. UploadThing
   hosts the file and hands back a URL that goes into the hackathon's imageUrl
   column like any other remote logo. The 4MB cap matches what the /logo proxy
   is willing to serve back out. */
export const uploadRouter = {
  hackathonImage: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(async () => {
      const gate = await requireAdminUser();

      if (!gate.ok) {
        throw new UploadThingError("Admins only.");
      }

      return { userId: gate.user.id };
    })
    .onUploadComplete(async ({ file }) => ({ url: file.ufsUrl })),
} satisfies FileRouter;

export type UploadRouter = typeof uploadRouter;
