const axios = require('axios');
const moment = require('moment');
const telegramBot = require('telegram-bot-api');
const client = require('twilio')(process.env.ACCOUNT_SID, process.env.AUTH_TOKEN);

const tgApi = new telegramBot({
  token: process.env.TELEGRAM_BOT_TOKEN
});

const checkAvailability = async (pincode, minAge) => {
  try {
    const date = moment().utc().add(5, 'h').add(30, 'm').format('DD-MM-YYYY');
    const response = await axios.get(`https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByPin?pincode=${pincode}&date=${date}`, {
      headers: {
        Accept: '*/*',
        'User-Agent': '*',
        'Content-Type': 'application/json'
      }
    });
    if (response && response.data) {
      const centers = response.data.centers;
      const filteredCenters = centers.map(center => {
        return {
          ...center,
          sessions: center.sessions.filter(
            (session) =>
              session.available_capacity_dose1 > 0 && session.min_age_limit === minAge
          ),
          vaccine: center.sessions.length && center.sessions[0].vaccine, 
        };
      });
      const availableCenters = [];
      filteredCenters.forEach(center => {
        if (center.sessions.length > 0) {
          availableCenters.push(center);
        }
      });
      if (availableCenters.length > 0) {
        let messageString = '';
        availableCenters.forEach(center => {
          messageString = messageString.concat(`<b>Center : </b>${center.name} \n<b>Age Group : </b>${minAge}+ \n<b>Availability : </b>\n`);
          center.sessions.forEach((session) => {
            messageString = messageString.concat(`• ${moment(session.date, 'DD-MM-YYYY').format('Do MMM')} \t <b>${session.available_capacity_dose1} slots</b>\n`);
          });
          messageString = messageString.concat(`<b>Vaccine : </b>${center.vaccine} -- ${center.fee_type} \n\n`);
        });

        // For Twilio
        // client.messages.create({
        //   body: '\nAvailable centers -- \n'.concat(smsString),
        //   from: '+17727948273',
        //   to: '+919899855244',
        // });
        // client.messages.create({
        //   from: 'whatsapp:+14155238886',
        //   to: 'whatsapp:+919899855244',
        //   body: '\nAvailable centers -- \n'.concat(smsString),
        // });

        // For Telegram
        tgApi.sendMessage({
          chat_id: '@cowinnotifier',
          text: `<u><b>${pincode}</b> \n\n</u>`.concat(messageString),
          parse_mode: 'html'
        }).then(resp => {
          console.log('Message was sent')
        }).catch(err => console.log('Error in Telegram API', err));
      }
      return [...availableCenters];
    } else {
      return { message: 'No data found' };
    }
  } catch (err) {
    console.log('Error in slot checking', err);
  }
}

exports.checkAvailability = checkAvailability;