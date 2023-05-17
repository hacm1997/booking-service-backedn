
import { Client } from '@opensearch-project/opensearch';
import { AwsSigv4Signer } from '@opensearch-project/opensearch/aws';
import { CredentialsOptions } from 'aws-sdk/lib/credentials';
import env from 'env/index';
import AWS from '../aws';

const options = {
  ...env.NODE_ENV !== 'development'
    ? AwsSigv4Signer({
      region: env.opensearch.region ?? 'us-east-2',
      getCredentials: async () =>
        await new Promise((resolve, reject) => {
          // Any other method to acquire a new Credentials object can be used.
          AWS.config.getCredentials((err: any, credentials: AWS.Credentials | CredentialsOptions | null) => {
            if (err === null && credentials === null) {
              reject(err);
            } else {
              resolve(credentials as CredentialsOptions);
            }
          });
        })
    })
    : {},
  node: env.opensearch.endpoint// OpenSearch domain URL
};

const client = new Client(options);

export default client;
