import { NextFunction, Request, Response } from 'express';
import { MailOptions } from 'utils/Mail/mailOptions.interface';
import { TransportOptions } from 'utils/Mail/transportOptions.interface';
import { MailService } from './service';

export const createEmail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const config = req.body as TransportOptions;
    const tenant = (req.headers.xsrfcookie as string)?.split(';').find((cookie: string) => cookie.includes('tenant'))?.split('=')[1];
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const mailerRepository = new MailService(tenant!);
    const result = await mailerRepository.createEmailConfig(config);
    if (!result) {
      res.status(400).json({
        message: 'Email Config Not Created'
      });
    } else {
      res.status(200).json({
        message: 'Email Config Created'
      });
    }
  } catch (error) {
    next(error);
  }
};

export const updateEmail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const config = req.body as TransportOptions;
    const tenant = (req.headers.xsrfcookie as string)?.split(';').find((cookie: string) => cookie.includes('tenant'))?.split('=')[1];
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const mailerRepository = new MailService(tenant!);
    const result = await mailerRepository.updateEmailConfig(config);
    if (!result) {
      res.status(400).json({
        message: 'Email Config Not Updated'
      });
    } else {
      res.status(200).json({
        message: 'Email Config Updated'
      });
    }
  } catch (error) {
    next(error);
  }
};

export const getEmail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenant = (req.headers.xsrfcookie as string)?.split(';').find((cookie: string) => cookie.includes('tenant'))?.split('=')[1];
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const mailerRepository = new MailService(tenant!);
    const result = await mailerRepository.getEmailConfig();
    if (result === null || result === undefined) {
      res.status(400).json({
        message: 'Email Config Not Found'
      });
    } else {
      res.status(200).json({
        message: 'Email Config Found',
        config: result
      });
    }
  } catch (error) {
    next(error);
  }
};

export const deleteEmail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenant = (req.headers.xsrfcookie as string)?.split(';').find((cookie: string) => cookie.includes('tenant'))?.split('=')[1];
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const mailerRepository = new MailService(tenant!);
    const result = await mailerRepository.deleteEmailConfig();
    if (!result) {
      res.status(400).json({
        message: 'Email Config Not Deleted'
      });
    } else {
      res.status(200).json({
        message: 'Email Config Deleted'
      });
    }
  } catch (error) {
    next(error);
  }
};

export const sendEmail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { to, subject, html, attachments } = req.body as Omit<MailOptions, 'from'>;
    const tenant = (req.headers.xsrfcookie as string)?.split(';').find((cookie: string) => cookie.includes('tenant'))?.split('=')[1];
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const mailerRepository = new MailService(tenant!);
    const mailOptions: MailOptions = {
      from: '',
      to,
      subject,
      html,
      attachments
    };
    await mailerRepository.sendEmail(mailOptions).then(() => {
      res.status(200).json({
        message: 'Email Sent'
      });
    }).catch((_error) => {
      res.status(400).json({
        message: 'Email Not Sent'
      });
    });
  } catch (error) {
    next(error);
  }
};
