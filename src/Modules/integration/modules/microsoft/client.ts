import * as msalNode from '@azure/msal-node';
import env from 'env/index';
import 'isomorphic-fetch'; // importar el polyfill
import * as microsoftGraph from '@microsoft/microsoft-graph-client';

export async function getClient (): Promise<microsoftGraph.Client | null> {
  const msalConfig = {
    auth: {
      clientId: env.microsoft.MICROSOFT_CLIENT as string,
      authority: `https://login.microsoftonline.com/ ${env.microsoft.MICROSOFT_TENANT as string}`,
      clientSecret: env.microsoft.MICROSOFT_SECRET as string
    }
  };
  try {
    const cca = new msalNode.ConfidentialClientApplication(msalConfig);
    const scopes = ['https://graph.microsoft.com/.default'];
    const tokenResponse = await cca.acquireTokenByClientCredential({
      scopes,
      authority: msalConfig.auth.authority
    });
    if (tokenResponse == null) {
      console.log('Error al autenticar la aplicación');
      return null;
    }
    const client = microsoftGraph.Client.init({
      authProvider: (done) => {
        done(null, tokenResponse.accessToken);
      }
    });
    return client;
  } catch (error) {
    console.log('Error al autenticar la aplicación');
    console.error(error);
    return null;
  }
}

export default getClient();
