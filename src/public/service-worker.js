const CACHE_NAME = 'Caché-1';
const FILES_TO_CACHE = [
  '/css/main.css',         // Hoja de estilos            // Script principal
  '/icons/web-app-manifest-192x192.png', // Icono de la app
  '/icons/favicon-96x96.png',  // Otro tamaño de icono
  '/icons/favicon.ico',
  '/js/bootstrap.bundle.min.js',
  '/css/bootstrap.min.css',
  '/js/bootstrap.bundle.min.js.map'
];

// Instalar el Service Worker y almacenar los archivos estáticos en caché
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching files during install');
        return cache.addAll(FILES_TO_CACHE).catch((error) => {
          console.error('Error caching files:', error);
        });
      })
      .catch((error) => {
        console.error('Failed to open cache:', error);
      })
  );
});


// Activación del Service Worker (limpieza de caches antiguos)
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            console.log(`Deleting old cache: ${cacheName}`);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Interceptar peticiones y servir desde la caché si es posible, de lo contrario, obtener de la red
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    // No cachear solicitudes que no sean GET
    return;
  }

  const url = new URL(event.request.url);
  if (url.origin !== location.origin) {
    // Si no es del mismo origen, deja que el navegador maneje la solicitud
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(event.request)
          .then((response) => {
            if (response && response.status === 200) {
              const clonedResponse = response.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, clonedResponse);
              });
            }
            return response;
          })
          .catch((error) => {
            console.error('Fetch failed for:', event.request.url, error);
          });
      })
  );
});



self.addEventListener('sync', (event) => {
  if (event.tag === 'syncData') {
    event.waitUntil(syncData());
  }
});

async function syncData() {
  const dbRequest = indexedDB.open('notesDatabase', 1);

  dbRequest.onsuccess = async function(event) {
    const db = event.target.result;
    const transaction = db.transaction('notes', 'readonly');
    const store = transaction.objectStore('notes');
    const allNotes = store.getAll(); // Obtener todos los datos almacenados

    allNotes.onsuccess = async function(event) {
      const notes = event.target.result;

      if (notes.length > 0) {
        console.log('Datos obtenidos de IndexedDB:', notes);

        // Lógica para enviar estos datos al servidor o a una API
        try {
          const response = await fetch('/api/sync-notes', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(notes),
          });

          if (!response.ok) {
            throw new Error('Error al sincronizar los datos');
          }

          console.log('Datos sincronizados con éxito');
        } catch (error) {
          console.error('Error al sincronizar los datos:', error);
        }
      } else {
        console.log('No hay datos para sincronizar');
      }
    };

    transaction.onerror = function() {
      console.error('Error al acceder a la base de datos');
    };
  };

  dbRequest.onerror = function() {
    console.error('Error al abrir la base de datos');
  };
}




  const request = indexedDB.open('notesDatabase', 1); // Nombre de la base de datos

// Evento cuando la base de datos es creada o actualizada
request.onupgradeneeded = function(event) {
  const db = event.target.result;
  const store = db.createObjectStore('notes', { keyPath: 'id', autoIncrement: true });

  // Crear índices para la búsqueda rápida
  store.createIndex('title', 'title', { unique: false });
  store.createIndex('description', 'description', { unique: false });
};

// Evento cuando la base de datos se abre correctamente
request.onsuccess = function(event) {
  const db = event.target.result;
  console.log('Base de datos abierta correctamente');
};

// Evento de error al abrir la base de datos
request.onerror = function(event) {
  console.error('Error al abrir la base de datos:', event.target.error);
};

// Ejemplo de cómo manejar datos de push
self.addEventListener('push', (event) => {
  let data;
  try {
    data = event.data.json();
  } catch (e) {
    console.error('Error al parsear los datos de la notificación:', e);
    return;
  }

  const options = {
    body: data.body,
    icon: '/icons/favicon.ico',
    badge: '/icons/badge.png'
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});
