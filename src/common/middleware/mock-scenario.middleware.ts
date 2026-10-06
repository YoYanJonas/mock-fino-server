import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { ErrorCodes } from '../errors/error-codes';
import { MOCK_SCENARIO_HEADER, parseMockScenario } from '../mock/scenarios';

const SLOW_DELAY_MS = 2500;

@Injectable()
export class MockScenarioMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const headerValue = req.header(MOCK_SCENARIO_HEADER) ?? req.header('X-Mock-Scenario');
    const scenario = parseMockScenario(headerValue);

    if (scenario === 'server-error') {
      res.status(500).json({
        error: {
          code: ErrorCodes.INTERNAL_ERROR,
          message: 'Simulated server failure.',
        },
      });
      return;
    }

    if (scenario === 'validation-error') {
      res.status(422).json({
        error: {
          code: ErrorCodes.VALIDATION_ERROR,
          message: 'Some fields are invalid.',
          fields: {
            legalName: 'This business name cannot be used.',
            'owners.0.email': 'This email address is already registered.',
          },
        },
      });
      return;
    }

    if (scenario === 'conflict') {
      res.status(409).json({
        error: {
          code: ErrorCodes.CONFLICT,
          message: 'The request conflicts with the current application state.',
        },
      });
      return;
    }

    if (scenario === 'slow') {
      setTimeout(() => next(), SLOW_DELAY_MS);
      return;
    }

    next();
  }
}
