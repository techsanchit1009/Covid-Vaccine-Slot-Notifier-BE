const axios = require('axios');
const moment = require('moment');
const telegramBot = require('telegram-bot-api');
const client = require('twilio')(process.env.ACCOUNT_SID, process.env.AUTH_TOKEN);

const tgApi = new telegramBot({
  token: process.env.TELEGRAM_BOT_TOKEN
});

const checkAvailability = async (pincode, minAge) => {
  try {
    const date = moment().format('DD-MM-YYYY');
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
              session.available_capacity > 0 && session.min_age_limit === minAge
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
        let smsString = '';
        availableCenters.forEach((center, i) => {
          smsString = smsString.concat(`• <b>${center.name}</b> -- (<b>${minAge}+</b>) -- ${center.fee_type} (${center.vaccine}) \n\n`);
        });
        // await client.messages.create({
        //   body: '\nAvailable centers -- \n'.concat(smsString),
        //   from: '+17727948273',
        //   to: '+919899855244',
        // });
        // client.messages.create({
        //   from: 'whatsapp:+14155238886',
        //   to: 'whatsapp:+919899855244',
        //   body: '\nAvailable centers -- \n'.concat(smsString),
        // });
        tgApi.sendMessage({
          chat_id: '@cowinnotifier',
          text: `<u><b>${moment().format('Do MMM YYYY')}</b> - Available centers for <b>${pincode}</b> \n\n</u>`.concat(smsString),
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