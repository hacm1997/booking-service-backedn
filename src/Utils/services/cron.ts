import { UpdateBookingUseCase } from '@Booking/app/useCases/UpdateBooking';
import { DynamoDBBookingRepository } from '@Booking/infrastucture/BookingDynamoDB';
import { GetPayUseCase } from 'Modules/Payment/app/usecases/getPay';
import { DynamoDBPaymentRepository } from 'Modules/Payment/db/repository/Payment';
import axios from 'axios';
import { CronJob } from 'cron';
import GoogleService from 'utils/Oauth/service/google';
import { GoogleOauthService } from 'Modules/integration/modules/google/auth/services';

export async function listenerEpayco (tenant: string, bookingCode: string, resourceCode: string, startDate: string, dni: string, booking: any): Promise <void> {
//   console.log('tenant corn => ', tenant);
//   console.log('Start Date => ', startDate);
//   console.log('bookign code corn => ', bookingCode);
  // console.log('cron time => ', parseInt(booking?.booking?.details?.only_appointments));
  // console.log('Bookign status=> ', booking?.booking?.details?.booked);

  let sum = 0;
  if (booking?.booking?.details?.booked === 'appointment') {
    console.log('status => ', booking?.booking?.details?.booked);
    await eventsToCalendar(booking, tenant);
  } else {
    const job = new CronJob(
      '*/1 * * * *',
      async function () {
        console.log('You will see this message every minute');
        sum += 1;
        console.log('the sum is => ', sum);
        if (sum > parseInt(booking?.booking?.details?.time_cron)) {
          try {
            const paymentRepository = new DynamoDBPaymentRepository(tenant);
            const getPayUseCase = new GetPayUseCase(paymentRepository);
            const payment = getPayUseCase.run(bookingCode);
            // console.log("payment => ",payment);
            payment.then(async (res) => {
              console.log('RES => ', res);
              for (const x of [res]) {
                console.log('Object => ', x);
              }
              if (res.facture.status === 'pending') {
                await epaycoResponse(tenant, startDate, resourceCode, res.facture.reference, res.facture.status, booking);
                job.stop();
              } else {
                console.log('Not found pending facture from booking');
                await eventsToCalendar(booking, tenant);
                job.stop();
              }
            }).catch(async (error) => {
              console.log(error);
              await updateBooking(tenant, startDate, resourceCode, 'canceled');
              console.log('CronJob Finished if exist facture payment');
              job.stop();
            });
            // console.log("is here!");
          } catch (error) {
            console.log(error);
            await updateBooking(tenant, startDate, resourceCode, 'canceled');
            job.stop();
          }
        }
      },
      null,
      true,
      'America/Los_Angeles'
    );
    if (sum === 0) {
      job.start();
    }
  }
}

export async function updateBooking (tenant: string, startDate: string, resourceId: string, state: string): Promise <void> {
  const bookingRepository = new DynamoDBBookingRepository(tenant, startDate);
  const bookingUseCase = new UpdateBookingUseCase(bookingRepository);
  const bookingUpdated = bookingUseCase.run(startDate, state, resourceId);
  try {
    bookingUpdated.then((res) => {
      console.log(res);
    }).catch((e) => {
      console.log(e);
    });
  } catch (error) {
    console.log(error);
  }
}

export async function epaycoResponse (tenant: string, startDate: string, resourceCode: string, referenceCode: string, statusBook: string, booking: any): Promise <void> {
  const epaycoUrl = process.env.EPAYCO_SEARCH_REFERENCE as string;

  let sum = 0;
  const job = new CronJob(
    '*/1 * * * *',
    function () {
      console.log('the sum before payed is => ', sum);
      sum += 1;
      if (sum > parseInt(booking?.booking?.details?.time_cron)) {
        axios.get(`${epaycoUrl}/${referenceCode}`).then(async (res) => {
          console.log('Response Epayco => ', res);
          if (res.data.data.x_response === 'Pendiente') {
            await updateBooking(tenant, startDate, resourceCode, 'canceled');
            job.stop();
          } else if (res.data.data.x_response === 'Aceptada') {
            await updateBooking(tenant, startDate, resourceCode, 'paid');
            await eventsToCalendar(booking, tenant);
            job.stop();
          } else {
            job.stop();
          }
        }).catch((err) => {
          console.log(err);
        });
        console.log('CronJob Finished in payment verification');
        job.stop();
      }
    },
    null,
    true,
    'America/Los_Angeles'
  );
  if (statusBook === 'pending') {
    job.start();
  }
}

export async function eventsToCalendar (booking: any, tenant: string): Promise <void> {
  console.log('Booking => ', booking);
  const event = {
    summary: booking?.booking?.details?.name ?? '',
    description: booking?.booking?.resource_code,
    location: booking?.booking?.details?.location ?? '',
    start: {
      dateTime: booking?.booking?.start_date ?? '',
      timeZone: 'America/Bogota'
    },
    end: {
      dateTime: booking?.booking?.end_date ?? '',
      timeZone: 'America/Bogota'
    },
    recurrence: ['RRULE:FREQ=DAILY;COUNT=2'],
    attendees: [
      { email: booking?.user?.email ?? '', displayName: booking?.user?.name ?? '' }
    ],
    sendNotifications: true,
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'email', minutes: 24 * 60 },
        { method: 'popup', minutes: 10 }
      ]
    }
  };
  const eventAppointment = {
    summary: booking?.booking?.details?.summary ?? '',
    description: booking?.booking?.resource_code,
    // location: booking?.booking?.details?.location ?? '',
    start: {
      dateTime: booking?.booking?.details?.start_date ?? '',
      timeZone: 'America/Bogota'
    },
    end: {
      dateTime: booking?.booking?.details?.end_date ?? '',
      timeZone: 'America/Bogota'
    },
    attendees: [
      { email: booking?.user?.email ?? '', displayName: booking?.user?.name ?? '' }
    ],
    sendNotifications: true,
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'email', minutes: 24 * 60 },
        { method: 'popup', minutes: 10 }
      ]
    }
  };
  console.log('Event => ', eventAppointment);
  const googleService = await GoogleService.getInstance(tenant ?? '');
  const googleOauthService = new GoogleOauthService(googleService);
  const auth = googleOauthService.getTokens();
  const calendarId = booking?.booking?.details?.calendar_id ?? '';
  const apiKey = booking?.booking?.details?.api_key ?? '';
  console.log('calendar ID => ', calendarId);
  console.log('ApiKey => ', apiKey);
  if (booking?.booking?.details?.booked === 'appointment') {
    auth.then(async (res) => {
      console.log(res);
      await sendEvent(res.accessToken ?? '', eventAppointment, calendarId, apiKey);
    }).catch((err) => {
      console.log(err);
    });
  } else {
    auth.then(async (res) => {
      console.log(res);
      await sendEvent(res.accessToken ?? '', event, calendarId, apiKey);
    }).catch((err) => {
      console.log(err);
    });
  }
}

export async function sendEvent (accessToken: string, event: any, calendarId: string, apiKey: string): Promise <void> {
  const settings = {
    method: 'post',
    url: `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?sendNotifications=true&sendUpdates=all&key=${apiKey}`,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    data: event
  };
  axios(settings).then((response) => {
    console.log(response);
  }).catch((error) => {
    console.log(error);
  });
}
