"use server";

import { ActionError, userAction } from "@/safe-action";
import { put } from "@vercel/blob";
import { z } from "zod";

export const uploadImageAction = userAction
  .schema(z.instanceof(FormData))
  .action(async ({ parsedInput: formData }) => {
    const file = formData.get("file") as File;

    if (!file) {
      throw new ActionError("File not found");
    }

    const name = file.name;

    const result = await put(name, file, {
      access: "public",
    });
    return result;
  });
