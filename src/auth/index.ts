import express, {Request, Response} from 'express';

import {ApiAndConfigParams} from '../types';

import {AuthMiddleware} from './types';
import {authBegin} from './auth-begin';
import {authCallback} from './auth-callback';

export function createAuthApp({
  api,
  config,
}: ApiAndConfigParams): AuthMiddleware {
  return function authApp(authParams = {}) {
    const params = {
      ...authParams,
    };

    const authApp = express();

    authApp.on('mount', () => {
      const mountPath = authApp.mountpath as string;

      config.auth.path = `${mountPath}${config.auth.path}`;
      config.auth.callbackPath = `${mountPath}${config.auth.callbackPath}`;
    });

    authApp.get(config.auth.path, async (req: Request, res: Response) => {
      return authBegin({req, res, api, config});
    });

    authApp.get(
      config.auth.callbackPath,
      async (req: Request, res: Response) => {
        return authCallback({
          req,
          res,
          api,
          config,
          afterAuth: params.afterAuth,
        });
      },
    );

    return authApp;
  };
}