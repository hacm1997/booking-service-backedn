import { StartOpenSearch } from '@Database/aws/opensearch/start';
import { DynamoDBConnection } from '@Database/Clients/dynamodb';
import { BookingApp } from './backend/BookingApp';

try {
  void DynamoDBConnection.build().then(async () => {
    void StartOpenSearch().then(async () => {
      console.log('OpenSearch started');
    }).catch((error) => {
      console.warn('Error starting OpenSearch: ', error);
    });
    const app = new BookingApp();
    await app.start();
  }).catch((error) => {
    console.error(error);
  });
} catch (error) {
  console.error(error);
}
