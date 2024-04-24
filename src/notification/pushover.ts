import { env } from '../env/server.js';
import { formatCurrency } from '../utils/currency.js';
import { formatPickupInterval } from '../utils/date.js';
import { type Notification } from '../types/notification.js';

export class Pushover {
  private static readonly url : string = 'https://api.pushover.net/1/messages.json';
  private readonly apiToken : string = env.NOTIFICATIONS_PUSHOVER_API_TOKEN;
  private readonly userToken : string = env.NOTIFICATIONS_PUSHOVER_USER_TOKEN;

  public send(notification: Notification) {
    switch (notification.type) {
      case 'newFavoriteAvailable':
        this.sendNewFavoriteAvailable(notification);
        break;
    }
  }

  public sendNewFavoriteAvailable(notification: Notification) {
    for (const item of notification.data) {

      const formattedPrice = formatCurrency(
        item.item.price_including_taxes.minor_units,
        item.item.price_including_taxes.decimals,
        item.item.price_including_taxes.code
      );
      
      const message = `${formattedPrice} - ${item.items_available}` +
        ` available\n${formatPickupInterval(item.pickup_interval)}`;
      


      const formData = new URLSearchParams();
      formData.append('token', this.apiToken);
      formData.append('user', this.userToken);
      formData.append('html', '1');
      formData.append('title', item.display_name);
      formData.append('message', message);
      formData.append('url', `https://share.toogoodtogo.com/item/${item.item.item_id}/`);
      formData.append('url_title', "Open in app");

      void fetch(Pushover.url, {
        method: 'POST',
        body: formData,
      }).then((response) => {
        console.log(`Sent pushover notification.`)
      }).catch((error) => {
        console.error(error);
      });
    }
  }
}
