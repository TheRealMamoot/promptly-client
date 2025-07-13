import { z } from "zod";

export const UserSchema = z
  .object({
    name: z
      .string()
      .min(1, "Full name is required")
      .refine((val) => /^[a-zA-Z]+(?: [a-zA-Z]+)+$/.test(val.trim()), {
        message: "Full name is required",
      }),
    email: z.string().email("Enter a valid email"),
    password: z.string().min(6, "Password must be at least 6 characters. "),
    confirmPassword: z.string().min(1, ""),
  })
  .superRefine((data, ctx) => {
    const { password, confirmPassword } = data;

    if (!/[A-Z]/.test(password)) {
      ctx.addIssue({
        path: ["password"],
        code: z.ZodIssueCode.custom,
        message: "Password must include at least one uppercase letter. ",
      });
    }

    if (!/[a-z]/.test(password)) {
      ctx.addIssue({
        path: ["password"],
        code: z.ZodIssueCode.custom,
        message: "Password must include at least one lowercase letter. ",
      });
    }

    if (!/[0-9]/.test(password)) {
      ctx.addIssue({
        path: ["password"],
        code: z.ZodIssueCode.custom,
        message: "Password must include at least one number. ",
      });
    }

    if (!/[!@#$%^&*]/.test(password)) {
      ctx.addIssue({
        path: ["password"],
        code: z.ZodIssueCode.custom,
        message: "Password must include at least one special character. ",
      });
    }

    if (password !== confirmPassword) {
      ctx.addIssue({
        path: ["confirmPassword"],
        code: z.ZodIssueCode.custom,
        message: "Passwords do not match. ",
      });
    }
  });
