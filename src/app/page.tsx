import { headers } from 'next/headers'
import { isAvailable, project } from 'gcp-metadata'
import { OAuth2Client } from 'google-auth-library';

export default function Home() {
  let aud: string;
  // 参考:https://cloud.google.com/nodejs/getting-started/authenticate-users?hl=ja
  const oAuth2Client = new OAuth2Client();

  const audience = async () => {
    if (!aud && (await isAvailable())) {
      const projectNumber = await project('numeric-project-id');
      const projectId = await project('project-id');
      aud = `/projects/${projectNumber}/apps/${projectId}`;
    }
    return aud;
  };
  const validateAssertion = async (assertion: string | undefined) => {
    if (!assertion) {
      return {};
    }
  
    aud = await audience();
  
    const response = await oAuth2Client.getIapPublicKeys();
    const ticket = await oAuth2Client.verifySignedJwtWithCertsAsync(
      assertion,
      response.pubkeys,
      aud,
      ['https://cloud.google.com/iap']
    );
    const payload = ticket.getPayload();
    return {
      email: payload?.email,
      sub: payload?.sub,
      exp: payload?.exp,
    };
  };

  const headersList = headers()
  const jwt = headersList.get('X-Goog-IAP-JWT-Assertion')
  if (jwt) {
    validateAssertion(jwt).then((result) => {
      console.log(result)
    })
  }
  return (
    <main>
      Hello {jwt}
    </main>
  );
}
