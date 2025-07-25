// clerk.d.ts

// This declaration file tells TypeScript about the custom metadata
// you've defined in your Clerk Dashboard.

declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      role?: "ADMIN" | "AGENT" | "USER";
    };
  }

  interface UserPublicMetadata {
    role?: "ADMIN" | "AGENT" | "USER";
    firstName?: string;
    lastName?: string;
  }
}

// The empty export is required to make this a module.
export {};