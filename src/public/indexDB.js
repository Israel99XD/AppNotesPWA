if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
      .then((registration) => {
        console.log('Service Worker registered with scope:', registration.scope);
  
        return registration.pushManager.getSubscription().then((subscription) => {
          if (subscription) {
            console.log('Already subscribed to push notifications');
            return subscription;
          }
  
          return registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array('BHx6ZkIA0UOBmBX9uEykvPZ1WUderh8Q9I75UgYgOLYQgxanM1YjZLTGGTktUkwRPTWggbphXfBeboZhcp_nnYc')
          }).then((subscription) => {
            console.log('Subscribed to push notifications:', subscription);
          });
        });
      })
      .catch((error) => {
        console.error('Service Worker registration failed:', error);
      });
  }
  


