# Task Overview
This repository contains a fully functional Node.js Express API backed by MongoDB for serving product inventory data, including products and their embedded reviews. The API works correctly but several endpoints are noticeably slow due to straightforward database and API-level performance problems such as over-fetching documents, running redundant queries, and returning very large payloads without any pagination. Your goal is to analyze the existing MongoDB usage and Node.js endpoint implementations, then apply basic yet effective optimizations so that key endpoints become much more responsive while preserving all existing functionality.

## Helpful Tips
- Consider where large amounts of data are being read from MongoDB and whether all of it is actually needed for each response.
- Consider which query patterns run frequently (such as listing products or filtering by category) and how the current implementation might be making them slower than necessary.
- Think about endpoints that fetch all documents from a collection and then filter or transform them in Node.js code rather than pushing simple filters to the database.
- Think about how often the same or very similar queries are executed inside loops or across multiple parts of a single request.
- Explore opportunities to reduce the size of API responses by returning only the fields needed for list views instead of entire documents with deeply nested arrays.
- Explore adding basic pagination to endpoints that can potentially return many products, so that each response transfers a manageable amount of data.
- Review how MongoDB collections are queried and whether simple indexes on commonly filtered fields could help obvious slow paths.
- Review the current request/response processing and see where you can eliminate redundant computations or unnecessary work in middleware and helper functions.
- Consider using simple in-memory caching for frequently requested data or repeated computations, while being mindful of correctness.
- Consider improving basic error handling and validation so that clearly invalid requests do not trigger heavy database operations.

## Database Access
- Host: `<DROPLET_IP>`
- Port: `27017`
- Database name: `utkrusht_store`
- Username: `appuser`
- Password: `apppassword`

You can connect to this MongoDB instance using common tools such as MongoDB Compass or `mongosh` to inspect collections, run simple explain plans, and observe how queries behave. Direct database access can help you understand which fields are queried most often and where indexes or small query rewrites might provide noticeable gains.

## Objectives
- Achieve noticeable improvement in the response times of the main product listing, category listing, and search endpoints.
- Improve MongoDB query execution by avoiding unnecessary full-collection scans where simple filters or indexes are appropriate.
- Reduce the size of responses by limiting the amount of data returned from the database, especially in endpoints used for list views.
- Implement basic pagination on at least one endpoint that returns many products to avoid sending excessively large payloads.
- Eliminate obvious redundant database calls inside endpoints (for example, repeated lookups of the same record or repeated full-collection queries).
- Introduce simple caching and straightforward endpoint refactors where they can help with repeated reads or expensive computations.
- Make small, clear improvements to the MongoDB schema usage (e.g., basic indexing choices) and the Node.js endpoint logic while keeping the overall architecture intact.
- Maintain clean, readable code that uses async/await, basic error handling, and clear naming so that future developers can easily understand your changes.

## How to Verify
- Measure the response time of key endpoints (such as listing all products and listing products by category) before and after your changes using a simple tool like curl, Postman, or a browser network panel; you should observe faster responses after optimization.
- Use MongoDB tools (e.g., `explain()` in `mongosh` or MongoDB Compass) to confirm that optimized queries are more efficient (for example, using indexes or scanning fewer documents) than the original ones.
- Confirm that endpoints no longer fetch the entire collection when a simple filter would suffice, and that large embedded fields are not unnecessarily included in every list response.
- Verify that pagination works as expected: requesting different pages and limits returns the correct subsets of products without errors and with smaller payload sizes.
- Check that cached or refactored endpoints still return correct and consistent data while making fewer repeated database calls per request.
- Ensure that all existing routes continue to function correctly (no breaking changes to URLs or basic response structures) and that error handling is still robust for invalid input or unexpected failures.
- Optionally log or observe the number of database operations per request (before vs. after) for one or two critical endpoints to validate that redundant queries were removed.