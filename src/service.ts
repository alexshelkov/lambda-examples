import {
  creator,
  transportService,
  loggerService,
  eventGatewayService,
  jsonBodyService,
} from '@alexshelkov/lambda';

import { slackTransport } from './slack';

export const res = creator(transportService)
  .srv(slackTransport)
  .srv(loggerService)
  .srv(eventGatewayService);

export type Creator = typeof res;

export const jsonRes = res.srv(jsonBodyService);

export type JsonCreator = typeof jsonRes;
