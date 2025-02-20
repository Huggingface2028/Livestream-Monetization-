import winston from 'winston';
import { Logtail } from '@logtail/node';

const logtailToken = process.env.LOGTAIL_TOKEN;

if (logtailToken === undefined) {
  throw new Error('LOGTAIL_TOKEN is not defined in the environment.');
}

const logtail = new Logtail(logtailToken);

const transports = [
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.colorize(),
      winston.format.simple()
    )
  }),
  new winston.transports.File({
    filename: 'logs/combined.log',
    format: winston.format.json()
  })
];

if (process.env.NODE_ENV === 'production') {
    transports.push(new winston.transports.Stream({
      stream: logtail.stream()
    }));
}

export const logger = winston.createLogger({
  level: 'info',
  transports,
  exceptionHandlers: [
    new winston.transports.File({ filename: 'logs/exceptions.log' })
  ],
  rejectionHandlers: [
    new winston.transports.File({ filename: 'logs/rejections.log' })
  ]
});
