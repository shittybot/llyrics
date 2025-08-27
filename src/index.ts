import axios from 'axios';
import { version } from '../package.json';

export interface searchOptions {
  /**
   * The song title
   */
  song: string;

  /**
   * The artist
   */
  artist?: string;

  /**
   * Search engine. Only Musixmatch and YouTube are supported
   */
  engine?: searchEngineOptions;

  /**
   * Changes search engine automatically if there are no results
   */
  forceSearch?: boolean;
}

export interface fetchResponse {
  /**
   * The artist
   */
  artist: string;

  /**
   * The song title
   */
  title: string;

  /**
   * The Musixmatch song id, or 0 if not from Musixmatch
   */
  id: string;

  /**
   * Used search engine
   */
  engine: string;

  /**
   * Cover URL
   */
  artworkURL: string;

  /**
   * The song lyrics
   */
  lyrics: string;

  /**
   * The response status
   */
  status: number;
}

export interface notFoundResponse {
  /**
   * The response status
   */
  status: 404;
}

export function isNotFoundResponse(response: fetchResponse | notFoundResponse): response is notFoundResponse {
  return response.status === 404;
}

const apiBaseUrl = 'https://lyrics.lewdhutao.my.eu.org/v2';
const searchEngines = ['youtube', 'musixmatch'] as const;

type searchEngineOptions = (typeof searchEngines)[number] | (string & {});

/**
 * Finds the lyrics of a song.
 * @param {searchOptions} searchOptions Options to refine your search
 * @returns Promise<fetchResponse>
 * @example
 * const { find } = require('llyrics');
 * const response = await find({
 *    song: 'Bohemian Rhapsody',
 *    engine: 'musixmatch'
 * });
 * console.log(response.artist);
 */
async function find(searchOptions: searchOptions): Promise<fetchResponse | notFoundResponse> {
  try {
    const fetchParams = {
      song: searchOptions.song,
      artist: searchOptions.artist,
      engine: searchOptions.engine,
    };

    if (!searchOptions.forceSearch) {
      return search(fetchParams);
    }

    return await Promise.any(
      searchEngines.map((currentEngine) => {
        return find({ ...fetchParams, engine: currentEngine });
      }),
    );
  } catch {
    return { status: 404 };
  }
}

async function search(searchOptions: Omit<searchOptions, 'forceSearch'>): Promise<fetchResponse | notFoundResponse> {
  const fetchResponse = await axios.get(`${apiBaseUrl}/${searchOptions.engine ?? 'youtube'}/lyrics`, {
    params: {
      title: searchOptions.song,
      artist: searchOptions.artist,
    },
  });

  if (!fetchResponse.data.data?.lyrics) {
    throw new Error('song not found');
  }

  return {
    artist: fetchResponse.data.data.artistName,
    title: fetchResponse.data.data.trackName,
    id: fetchResponse.data.data.trackId,
    engine: fetchResponse.data.data.searchEngine,
    artworkURL: fetchResponse.data.data.artworkUrl,
    lyrics: fetchResponse.data.data.lyrics,
    status: fetchResponse.status,
  };
}

export { version, find };
