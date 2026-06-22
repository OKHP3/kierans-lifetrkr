declare global {
  interface Window {
    google: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string
            scope: string
            prompt?: string
            callback: (response: {
              access_token: string
              expires_in: number
              error?: string
            }) => void
          }) => {
            requestAccessToken: () => void
          }
          revoke: (token: string, callback: () => void) => void
        }
      }
    }
    gapi: {
      load: (lib: string, callback: () => void) => void
      client: {
        init: (config: object) => Promise<void>
        request: (args: object) => Promise<{ result: unknown }>
      }
    }
  }
}

export {}
