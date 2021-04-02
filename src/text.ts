import { GetServiceMdl, GetErrorMdl } from '@alexshelkov/lambda';

import { object, string, Describe, enums } from 'superstruct';
import * as yup from 'yup';

import { yupValidator } from './yup';
import { structValidator } from './struct';

export enum LogTypes {
  error = 'error',
  info = 'info',
  log = 'log',
}

export type Text = {
  type: LogTypes;
  message: string;
};

// Struct ------------------------------------------------------------

const StructSchema: Describe<Text> = object({
  type: enums(Object.values(LogTypes)),
  message: string(),
});

export const structService = structValidator({ text: StructSchema });

export type StructService = GetServiceMdl<typeof structService>;

export type StructErrors = GetErrorMdl<typeof structService>;

// Yup ----------------------------------------------------------------

export const YupSchema = yup.object({
  message: yup.string().defined(),
  type: yup.mixed<LogTypes>().oneOf(Object.values(LogTypes)).defined(),
});

export const yupService = yupValidator({ text: YupSchema });

export type YupService = GetServiceMdl<typeof yupService>;

export type YupErrors = GetErrorMdl<typeof yupService>;
