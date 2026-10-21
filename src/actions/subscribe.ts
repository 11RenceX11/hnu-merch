"use server";

import { getFieldErrors, SubscribeSchema } from "@/lib/definitions";
import type { FormState } from "@/lib/definitions";
import { isRateLimited } from "@/lib/rate-limit";
import { addSubscriber } from "@/lib/subscribers";

/** Newsletter sign-up (drop alerts). */
export async function subscribe(state: FormState, formData: FormData): Promise<FormState> {
  if (await isRateLimited("subscribe", 5)) {
    return { message: "Too many attempts. Please wait a minute and try again." };
  }

  const validatedFields = SubscribeSchema.safeParse({ email: formData.get("email") });

  if (!validatedFields.success) {
    return { errors: getFieldErrors(validatedFields.error) };
  }

  await addSubscriber(validatedFields.data.email);

  return { success: "You are on the list. We will email you when the next drop lands." };
}
