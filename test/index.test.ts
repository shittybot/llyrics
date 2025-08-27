import { find, isNotFoundResponse } from '../src/index';

(async () => {
  try {
    const response = await find({
      song: "rickroll",
      engine: "youtube",
      forceSearch: true,
    });

    async function getLyrics() {
      try {
        if (response && !isNotFoundResponse(response)) {
          console.log('Artist:', response.artist);
          console.log('Title:', response.title);
          console.log('Engine:', response.engine);
          console.log('Artwork URL:', response.artworkURL);
          console.log('Lyrics:', response.lyrics);
          console.log('Status: ', response.status);
        } else {
          console.log('No lyrics found.');
        }
      } catch (error) {
        console.error('Error fetching lyrics:', error);
      }
    }

    await getLyrics();
  } catch (error) {
    console.error('Error with find function:', error);
  }
})();
