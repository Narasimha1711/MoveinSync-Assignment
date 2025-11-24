import Joi from 'joi';

export const validateAlert = (req, res, next) => {
  const schema = Joi.object({
    sourceType: Joi.string().required(),
    severity: Joi.string().valid('Info', 'Warning', 'Critical').default('Info'),
    metadata: Joi.object({
      driverId: Joi.string().required(),
      document_renewed: Joi.boolean().optional()
    }).unknown(true)
  });

  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });
  next();
};