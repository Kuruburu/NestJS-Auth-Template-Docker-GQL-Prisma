import * as Joi from 'joi';

export const configValidationSchema = Joi.object({
  // 🧱 NEST
  PORT: Joi.number().default(3000),

  // 🔐 SECURITY
  JWT_ACCESS_SECRET: Joi.string().min(32).required().messages({
    'any.required': 'JWT_ACCESS_SECRET is required',
    'string.empty': 'JWT_ACCESS_SECRET cannot be empty',
  }),

  ENABLE_GOOGLE_AUTH: Joi.boolean().default(false),
  CLIENT_ID: Joi.string().when('ENABLE_GOOGLE_AUTH', {
    is: true,
    then: Joi.required().allow('').messages({ 'any.required': 'Google CLIENT_ID is required' }),
    otherwise: Joi.optional(),
  }),
  CLIENT_SECRET: Joi.string().when('ENABLE_GOOGLE_AUTH', {
    is: true,
    then: Joi.required().allow('').messages({ 'any.required': 'Google CLIENT_SECRET is required' }),
    otherwise: Joi.optional(),
  }),
  CALLBACK_URL: Joi.string().when('ENABLE_GOOGLE_AUTH', {
    is: true,
    then: Joi.string().allow('').uri().required().messages({
      'any.required': 'Google CALLBACK_URL is required',
      'string.uri': 'CALLBACK_URL must be a valid URI',
    }),
    otherwise: Joi.optional(),
  }),

  // 🕓 OPTIONAL SECURITY SETTINGS
  EXPIRES_IN: Joi.string().default('5m'),
  REFRESH_IN: Joi.string().default('7d'),
  BCRYPT_SALT_OR_ROUND: Joi.alternatives().try(Joi.number(), Joi.string()).default(10),
  REFRESH_TOKEN_EXPIRATION_IN_DAYS: Joi.number().default(30),
  REFRESH_TOKEN_SHORT_EXPIRATION_IN_HOURS: Joi.number().default(8),

  // 🧠 OPTIONAL FLAGS
  ENABLE_SWAGGER: Joi.boolean().default(true),
  ENABLE_CORS: Joi.boolean().default(true),
  GRAPHQL_DEBUG: Joi.boolean().default(false),
  GRAPHQL_PLAYGROUND: Joi.boolean().default(true),
}).options({ convert: true }); // 👈 this ensures "false" → false
