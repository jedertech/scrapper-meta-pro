import test from 'node:test';
import assert from 'node:assert/strict';
import { BrowserHealth } from '../dist/browser-health.js';

const event=(phase,kind,detail,status=null,adsDetected=0,pendingRequests=0)=>({phase,kind,detail,status,adsDetected,pendingRequests,
  url:'https://www.facebook.com/ads/library/',resourceType:kind,finalNavigation:phase==='navigation'});

test('salud resume progreso, solicitudes, error GraphQL y restricción sin consultar la red',()=>{
  const health=new BrowserHealth();
  health.setLifecycle('connected','available','available');
  health.observe(event('navigation','document','final_response',200));
  health.observe(event('wait','document','content_visible',200));
  assert.equal(health.snapshot.pageState,'loaded');
  health.observe(event('json','graphql','operation:AdLibrarySearchPaginationQuery;new_ids:2;consecutive_errors:0',200,2,1));
  assert.equal(health.snapshot.lastProgressAt!==null,true);
  health.observe(event('json','graphql','operation:AdLibrarySearchPaginationQuery;new_ids:0;consecutive_errors:3',200,2,2));
  health.observe(event('response','graphql','',403,2,0));
  assert.equal(health.snapshot.graphqlErrors,3);
  assert.equal(health.snapshot.restriction,403);
  assert.equal(health.snapshot.pendingRequests,0);
  assert.equal(health.snapshot.httpDocument,200);
  health.observe(event('dom','document','access_verification_visible',200));
  assert.equal(health.snapshot.pageState,'verification');
  health.setLifecycle('closed','closed','closed');
  assert.equal(health.snapshot.page,'closed');
});
