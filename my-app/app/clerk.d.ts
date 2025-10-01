declare global {

  interface ClerkAuthorization{
    permission: ''
    role: 'org:admin' | 'org"agent' | 'org:member'
  }

}

// The empty export is required to make this a module.
export {};