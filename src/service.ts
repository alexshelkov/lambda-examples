import {
  creator,
  transportService,
  loggerService,
  eventGatewayService,
  GetService,
} from '@alexshelkov/lambda';

import { slackTransport } from './slack';

export const res = creator(transportService)
  .srv(slackTransport)
  .srv(eventGatewayService)
  .srv(loggerService);

export type Service = GetService<typeof res>;
