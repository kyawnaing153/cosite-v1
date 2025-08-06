// Invoice Labour Detail routes
  app.get('/api/invoice-labour-details/:invoiceId', authenticateToken, async (req, res) => {
    try {
      const invoiceId = parseInt(req.params.invoiceId);
      const details = await storage.getInvoiceLabourDetails(invoiceId);
      res.json(details);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch invoice labour details' });
    }
  });

  app.post('/api/invoice-labour-details', authenticateToken, async (req: any, res) => {
    try {
      const detailData = insertInvoiceLabourDetailSchema.parse({
        ...req.body,
        recordedByUserId: req.user.id,
      });
      const detail = await storage.createInvoiceLabourDetail(detailData);
      res.status(201).json(detail);
    } catch (error) {
      console.error('Invoice labour detail creation error:', error);
      res.status(400).json({ message: 'Invalid invoice labour detail data' });
    }
  });