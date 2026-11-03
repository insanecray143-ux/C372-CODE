const services = require('../data/mockServices');

// Prepare payment details for a service (does NOT charge money)
function preparePayment(req, res) {
  // Route params are strings, so compare against the catalogue ID as a string
  const service = services.find(
    (item) => String(item.id) === req.params.serviceId
  );

  if (!service) {
    return res.status(404).json({ error: 'Service not found' });
  }

  // Amount always comes from the catalogue, never from the client
  res.status(200).json({
    serviceId: service.id,
    serviceName: service.name,
    amount: service.price,
    currency: 'sgd',
    status: 'READY_FOR_PAYMENT'
  });
}

module.exports = { preparePayment };
