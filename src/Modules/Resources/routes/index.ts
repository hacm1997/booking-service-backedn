import { createResource } from '@Resources/controllers/create';
import { getResourceByCodeController } from '@Resources/controllers/getByCode';
import { getAllResourcesByFiltersController } from '@Resources/controllers/getBYFilters';
import { updateResource } from '@Resources/controllers/update';
import { Router } from 'express';
import { deleteResource } from '../controllers/delete';

const ResourcesRouter = Router();

export enum DBType {
  dynamo = 'dynamo',
  opensearch = 'opensearch'
}

ResourcesRouter.post('/', async (req, res, next) => {
  try {
    await createResource(req, res, next);
  } catch (error) {
    next(error);
  }
});

ResourcesRouter.delete('/:code', async (req, res, next) => {
  try {
    await deleteResource(req, res, next);
  } catch (error) {
    next(error);
  }
});
// get all resources by tenant in cookies with pagination in query and filters in query
ResourcesRouter.get('/', async (req, res, next) => {
  try {
    await getAllResourcesByFiltersController(req, res, next, DBType.dynamo);
  } catch (error) {
    next(error);
  }
});

// get all resources by tenant in cookies with pagination in query and filters in query
ResourcesRouter.get('/search', async (req, res, next) => {
  try {
    await getAllResourcesByFiltersController(req, res, next, DBType.opensearch);
  } catch (error) {
    next(error);
  }
});

ResourcesRouter.get('/:code', async (req, res, next) => {
  try {
    await getResourceByCodeController(req, res, next);
  } catch (error) {
    next(error);
  }
});

ResourcesRouter.put('/:code', async (req, res, next) => {
  const resource = req.body;
  const tenant = req.cookies.tenant;
  resource.tenant = tenant;
  await updateResource(req, res, next);
});

export default ResourcesRouter;
