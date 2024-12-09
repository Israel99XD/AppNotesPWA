import webPush from 'web-push';

const vapidKeys = {
  publicKey: 'BJ66BCXQsh7H_Ta1uRT3O-YfllzvPXC-Ea7Mrw3nwpZ_ej8ABuxJvZBL3C2kEnbNWKJMCwffYhwvGAKidRU_9JU',
  privateKey: 'vKM3wgz32Xc6PqHFO7bCd5Z6yOOIpLZLVuVauIWcYro'
};

webPush.setVapidDetails(
  'mailto:israelsldn@gmail.com',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

export default webPush;
