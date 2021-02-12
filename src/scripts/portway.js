const Cache = require( "@11ty/eleventy-cache-assets" );

/**
 * Fetch a Portway API endpoint, caching the response.
 *
 * @param {string} apiKey
 * @param {string} endpoint - ex., "/projects/<id>/documents"
 * @param {object} [urlOptions]
 * @param {object} [fetchOptions]
 * @return {Promise<>Object}
 */
function fetch( apiKey, endpoint, urlOptions={}, fetchOptions={} )
{
	let url = new URL( `https://api.portway.app/api/v1/${endpoint}` );

	if( urlOptions.params )
	{
		Object.keys( urlOptions.params ).forEach( key =>
		{
			url.searchParams.append( key, urlOptions.params[key] );
		});
	}

	fetchOptions.headers = fetchOptions.headers || {};
	fetchOptions.headers.Authorization = `Bearer ${apiKey}`;

	let cacheOptions = {
		duration: process.env.PORTWAY_CACHE_DURATION || "5m",
		type: "json",
		fetchOptions: fetchOptions,
	};

	return Cache( url.toString(), cacheOptions );
}

module.exports.fetch = fetch;
