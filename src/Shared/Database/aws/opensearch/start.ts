import { OpenSearch } from '@Database/Clients/opensearch';

export const StartOpenSearch = async (): Promise<void> => {
  const opensearch = new OpenSearch();
  const exists = await opensearch.indexExists();
  if (exists === false) {
    await opensearch.createIndex().then(() => {
      console.log('Index created');
    }).catch((error) => {
      console.log('Error creating index', error);
    });
  } else {
    console.log('Index already exists');
  }
};
