
import { IWhatsAppInstanceRepository } from '@domain/Repositories/IWhatsAppInstanceRepository';
import { Request, Response } from 'express';
import pino from 'pino';

export class QRViewController {
  private logger = pino();

  constructor(private repository: IWhatsAppInstanceRepository) {}

  async renderQRPage(req: Request, res: Response): Promise<void> {
    try {
      const { instanceId } = req.params;

      const instance = await this.repository.findById(instanceId);
      
      if (!instance) {
        return res.status(404).render('error', {
          message: 'Instancia no encontrada',
          instanceId
        });
      }

      res.render('qr-code', {
        instanceId: instance.instanceId,
        instanceName: instance.name,
        qrCode: instance.qrCode,
        qrText: instance.qrText,
        status: instance.status.value,
        phoneNumber: instance.phoneNumber?.value
      });
    } catch (error: any) {
      this.logger.error('Error rendering QR page:', error);
      res.status(500).render('error', {
        message: 'Error al cargar la página',
        error: error.message
      });
    }
  }

  async getQRStatus(req: Request, res: Response): Promise<Response> {
    try {
      const { instanceId } = req.params;

      const instance = await this.repository.findById(instanceId);
      
      if (!instance) {
        return res.status(404).json({ error: 'Instance not found' });
      }

      return res.json({
        status: instance.status.value,
        qrCode: instance.qrCode,
        qrText: instance.qrText,
        phoneNumber: instance.phoneNumber?.value,
        connected: instance.status.isConnected()
      });
    } catch (error: any) {
      this.logger.error('Error getting QR status:', error);
      return res.status(500).json({ error: error.message });
    }
  }
}